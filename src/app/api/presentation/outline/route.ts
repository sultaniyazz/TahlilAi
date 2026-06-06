import {
  getLatestUserMessage,
  getMessageText,
  toModelMessages,
} from "@/lib/ai/uiMessageParts";
import {
  assertModelIsConfigured,
  DEFAULT_MODEL_PROVIDER,
  DEFAULT_OPENROUTER_MODEL,
  ensureModelIsReady,
  modelPicker,
} from "@/lib/modelPicker";
import { createLogger } from "@/lib/observability/logger";
import { logger } from "@/lib/observability/server/logger";
import { guardAiRoute } from "@/lib/api-guards";
import { streamText, type UIMessage } from "ai";
import { NextResponse } from "next/server";

interface OutlineRequest {
  messages?: UIMessage[];
}

interface OutlineMessageMetadata {
  numberOfCards?: number;
  language?: string;
  modelId?: string;
  modelProvider?: "openai" | "ollama" | "lmstudio" | "openrouter";
  webSearch?: boolean;
  textContent?: "minimal" | "ixcham" | "batafsil" | "keng qamrovli";
  tone?: string;
  audience?: string;
  scenario?: string;
  presentationId?: string;
}

const outlineSystemPrompt = `You are an expert presentation outline generator. Your task is to create a comprehensive and engaging presentation outline based on the user's topic.

Current Date: {currentDate}

## Presentation Customization:
- Text Content Level: {textContent}
- Tone: {tone}
- Target Audience: {audience}
- Scenario: {scenario}

## Your Process:
1. Analyze the topic
2. {researchStep}
3. Generate the outline

## Web Search Guidelines:
{webSearchGuidelines}

## Outline Requirements:
- First generate an appropriate title for the presentation
- Generate exactly {numberOfCards} main topics
- Each topic should be a clear, engaging heading
- Include 2-3 bullet points per topic
- Use {language} language
- Adapt content depth based on the text content level
- Tailor language for the requested tone, audience, and scenario
- ALWAYS use bullet points formatted as "- point text"
- Do not use bold, italic, or underline

## Output Format:
Start with the title in XML tags, then generate markdown with each topic as a heading followed by bullet points.

Example:
<TITLE>Your Generated Presentation Title Here</TITLE>

# First Main Topic
- Key point
- Another point

# Second Main Topic
- Key point
- Another point

Remember: {finalInstruction}`;

function buildOutlineSystemPrompt({
  actualLanguage,
  numberOfCards,
  currentDate,
  textContent,
  tone,
  audience,
  scenario,
  webSearch,
}: {
  actualLanguage: string;
  numberOfCards: number;
  currentDate: string;
  textContent: NonNullable<OutlineMessageMetadata["textContent"]>;
  tone: string;
  audience: string;
  scenario: string;
  webSearch: boolean;
}) {
  return outlineSystemPrompt
    .replace("{currentDate}", currentDate)
    .replace("{numberOfCards}", numberOfCards.toString())
    .replace("{language}", actualLanguage)
    .replaceAll("{textContent}", textContent)
    .replaceAll("{tone}", tone)
    .replaceAll("{audience}", audience)
    .replaceAll("{scenario}", scenario)
    .replace(
      "{researchStep}",
      webSearch
        ? "Research first using web search before writing the outline"
        : "Use existing knowledge only and skip tool usage",
    )
    .replace(
      "{webSearchGuidelines}",
      webSearch
        ? [
            "- Use web search for current facts, recent developments, and useful statistics",
            "- Limit yourself to a few focused searches",
            "- Only search when it materially improves the outline",
          ].join("\n")
        : "- Web search is disabled for this request.",
    )
    .replace(
      "{finalInstruction}",
      webSearch
        ? "Perform at least one web search before generating the outline."
        : "Generate the outline directly without web search.",
    );
}

function getErrorStatus(error: unknown): number | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const status = (error as Record<string, unknown>).status;
  const statusCode = (error as Record<string, unknown>).statusCode;

  if (typeof status === "number") {
    return status;
  }

  if (typeof statusCode === "number") {
    return statusCode;
  }

  const message = String((error as Record<string, unknown>).message ?? "");
  if (/429|rate limit|quota/i.test(message)) {
    return 429;
  }

  return null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message || "Unknown error";
    const stack = error.stack ? error.stack.split('\n').slice(0, 3).join('\n') : '';
    return stack ? `${message}\n${stack}` : message;
  }

  if (typeof Response !== "undefined" && error instanceof Response) {
    return `HTTP ${error.status} ${error.statusText}`;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  if (typeof error === "string") {
    return error;
  }

  // Provide better diagnostics for empty objects
  if (error && typeof error === "object") {
    const keys = Object.keys(error);
    if (keys.length === 0) {
      return "Unknown error (empty error object)";
    }
    try {
      return JSON.stringify(error, Object.keys(error), 2);
    } catch {
      return String(error);
    }
  }

  try {
    return JSON.stringify(error, Object.keys(error ?? {}), 2);
  } catch {
    return "An unknown error occurred.";
  }
}

export async function POST(req: Request) {
  const actionName = "presentation.outline.post";
  const requestId = crypto.randomUUID();
  const routeLogger = createLogger("api:presentation-outline");
  const span = logger.startSpan(`tahlilai.api.${actionName}`, {
    attributes: {
      "tahlilai.scope": "api",
      "tahlilai.action.type": "api_route",
      "tahlilai.action.name": actionName,
      "http.method": "POST",
      "http.route": "/api/presentation/outline",
      "tahlilai.request.id": requestId,
    },
  });

  try {
    routeLogger.info("Outline request received", { requestId });
    const guard = await guardAiRoute({ checkStars: true });
    if (guard.error) {
      routeLogger.warn("Outline request rejected", { requestId });
      span.event("tahlilai.api.request_rejected", {
        "tahlilai.validation.error": "unauthorized",
      });
      return guard.error;
    }
    const { session } = guard;

    const request = (await req.json()) as OutlineRequest;
    const { messages = [] } = request;
    const latestUserMessage = getLatestUserMessage(messages);
    const prompt = latestUserMessage ? getMessageText(latestUserMessage).trim() : "";
    const metadata =
      (latestUserMessage?.metadata as OutlineMessageMetadata | undefined) ?? {};
    const numberOfCards = Math.max(1, metadata.numberOfCards ?? 5);
    const language = metadata.language?.trim() || "en-US";
    const modelProvider = metadata.modelProvider ?? DEFAULT_MODEL_PROVIDER;
    const modelId = metadata.modelId;
    const webSearch = Boolean(metadata.webSearch);

    span.annotate({
      "tahlilai.presentation.cards.count": numberOfCards,
      "tahlilai.presentation.prompt.length": prompt.length,
      "tahlilai.presentation.language": language,
      "tahlilai.presentation.web_search": webSearch,
    });
    routeLogger.info("Validated outline request payload", {
      requestId,
      numberOfCards,
      promptLength: prompt.length,
      language,
      modelProvider,
      modelId: modelId || DEFAULT_OPENROUTER_MODEL,
      webSearch,
    });

    if (messages.length === 0 || !prompt) {
      routeLogger.warn("Outline request rejected: missing required fields", {
        requestId,
        hasPrompt: Boolean(prompt),
        numberOfCards,
        language,
        messageCount: messages.length,
      });
      span.event("tahlilai.api.request_rejected", {
        "tahlilai.validation.error": "missing_required_fields",
      });
      return NextResponse.json(
        { error: "Missing required prompt or messages for outline generation." },
        { status: 400 },
      );
    }

    if (metadata.numberOfCards == null || !metadata.language) {
      routeLogger.warn("Outline request payload missing optional metadata, using defaults", {
        requestId,
        numberOfCards,
        language,
        hasNumberOfCards: metadata.numberOfCards != null,
        hasLanguage: Boolean(metadata.language),
      });
    }

    const languageMap: Record<string, string> = {
      "en-US": "English (US)",
      pt: "Portuguese",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      ja: "Japanese",
      ko: "Korean",
      zh: "Chinese",
      ru: "Russian",
      hi: "Hindi",
      ar: "Arabic",
    };

    const actualLanguage = languageMap[language] ?? language;
    const currentDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    try {
      assertModelIsConfigured(modelProvider, modelId);
    } catch (error) {
      routeLogger.error("Outline request rejected: invalid model configuration", error, {
        requestId,
        modelProvider,
        modelId: modelId || DEFAULT_OPENROUTER_MODEL,
      });
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Invalid model configuration",
        },
        { status: 400 },
      );
    }
    try {
      await ensureModelIsReady(modelProvider, modelId);
    } catch (error) {
      routeLogger.error(
        "Outline request rejected: selected model could not be prepared",
        error,
        {
          requestId,
          modelProvider,
          modelId: modelId || DEFAULT_OPENROUTER_MODEL,
        },
      );
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Failed to prepare selected model",
        },
        { status: 503 },
      );
    }

    const systemPrompt = buildOutlineSystemPrompt({
      actualLanguage,
      numberOfCards,
      currentDate,
      textContent: metadata.textContent ?? "ixcham",
      tone: metadata.tone ?? "auto",
      audience: metadata.audience ?? "auto",
      scenario: metadata.scenario ?? "auto",
      webSearch,
    });

    routeLogger.info("Presentation outline generation started", {
      requestId,
      modelProvider,
      modelId: modelId || DEFAULT_OPENROUTER_MODEL,
      numberOfCards,
      webSearch,
    });

    const result = streamText({
      model: modelPicker(modelProvider, modelId),
      system: systemPrompt,
      messages: toModelMessages(messages),
    });

    routeLogger.info("Presentation outline stream created", {
      requestId,
      modelProvider,
      modelId: modelId || DEFAULT_OPENROUTER_MODEL,
    });
    span.event("tahlilai.api.response_stream_created");

    return result.toUIMessageStreamResponse();
  } catch (error) {
    const status = getErrorStatus(error) ?? 500;
    const message = getErrorMessage(error) || "Failed to generate outline";

    if (status === 429) {
      routeLogger.warn("Presentation outline generation rate limited", {
        requestId,
        status,
        error: getErrorMessage(error),
      });
    } else {
      routeLogger.error("Presentation outline generation failed", error, {
        requestId,
        status,
      });
    }

    span.error(error);
    return NextResponse.json({ error: message }, { status });
  } finally {
    span.end();
  }
}
