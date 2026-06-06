import { guardAiRoute } from "@/lib/api-guards";
import { NextResponse } from "next/server";

interface AnalyzeFileRequest {
  fileUrl: string;
  fileName?: string;
  fileType?: string;
}

interface AnalyzeFileResponse {
  success: true;
  fileName?: string;
  fileType?: string;
  text: string;
  summary: string;
  prompt: string;
}

function normalizeMimeType(type?: string) {
  if (typeof type !== "string" || type.length === 0) return undefined;
  const rawType = type as string;
  const firstSegment = rawType.split(";")[0] ?? "";
  const normalized = firstSegment.trim().toLowerCase();
  return normalized || undefined;
}

function getExtFromFileName(fileName?: string) {
  if (!fileName) return undefined;
  const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match ? match[1] : undefined;
}

function getDefaultMimeType(fileName?: string) {
  const ext = getExtFromFileName(fileName);
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "doc":
      return "application/msword";
    case "txt":
      return "text/plain";
    default:
      return undefined;
  }
}

function normalizeText(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[\t\u00A0]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function createPromptFromText(text: string, fileName?: string) {
  const cleaned = normalizeText(text);
  const sample = cleaned.length > 3000 ? `${cleaned.slice(0, 3000)}...` : cleaned;
  const title = fileName ? `for the document “${fileName}”` : "for the uploaded document";

  return `Create a clear and engaging presentation prompt ${title} using the document content below. Focus on the main topic, the intended audience, and the key ideas that should be included in the slide deck.\n\n${sample}`;
}

function summarizeText(text: string) {
  const cleaned = normalizeText(text);
  const lines = cleaned
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return "No readable text could be extracted from this document.";
  }

  const firstLines = lines.slice(0, 8).join(" ");
  const short = firstLines.length > 1000 ? `${firstLines.slice(0, 1000)}...` : firstLines;
  return short;
}

async function parseDocumentContent(
  fileUrl: string,
  contentType: string,
  fileName?: string,
) {
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch file from upload URL: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = normalizeMimeType(contentType) || response.headers.get("content-type") || getDefaultMimeType(fileName);

  if (!mimeType) {
    throw new Error("Unable to determine file type for analysis.");
  }

  if (mimeType === "application/pdf") {
    const pdfParse = (await import("pdf-parse")).default;
    const parsed = await pdfParse(buffer);
    return normalizeText(parsed.text ?? "");
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    const mammoth = (await import("mammoth")).default;
    const result = await mammoth.extractRawText({ buffer });
    return normalizeText(result.value ?? "");
  }

  if (mimeType.startsWith("text/") || mimeType === "application/octet-stream") {
    return normalizeText(buffer.toString("utf-8"));
  }

  throw new Error(`File type ${mimeType} is not supported for document analysis.`);
}

export async function POST(req: Request) {
  try {
    const guard = await guardAiRoute();
    if (guard.error) return guard.error;

    const request = (await req.json()) as AnalyzeFileRequest;
    const { fileUrl, fileName, fileType } = request;

    if (!fileUrl) {
      return NextResponse.json(
        { error: "Missing fileUrl in request body." },
        { status: 400 },
      );
    }

    const text = await parseDocumentContent(fileUrl, fileType ?? "", fileName);
    const summary = summarizeText(text);
    const prompt = createPromptFromText(text, fileName);

    const response: AnalyzeFileResponse = {
      success: true,
      fileName,
      fileType: fileType ?? "unknown",
      text,
      summary,
      prompt,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("File analysis error:", error);
    const message = error instanceof Error ? error.message : "Failed to analyze uploaded document.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
