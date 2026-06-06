"use client";

import { useUploadThing } from "@/hooks/globals/useUploadthing";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface FileAnalysisResult {
  summary?: string;
  prompt?: string;
  fileName?: string;
}

export function useFileAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FileAnalysisResult | null>(null);

  const { startUpload } = useUploadThing("editorUploader", {
    onClientUploadComplete: () => {},
    onUploadError: (error: Error) => {
      console.error("File upload error:", error);
      toast.error(error.message || "Upload failed. Please try again.");
    },
  });

  const analyzeFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) {
      return null;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const uploadResult = await startUpload(files);
      const uploaded = uploadResult?.[0];

      if (!uploaded?.ufsUrl) {
        throw new Error("Upload failed. Please try again.");
      }

      const response = await fetch("/api/presentation/analyze-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileUrl: uploaded.ufsUrl,
          fileName: uploaded.name,
          fileType: uploaded.type,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Document analysis failed.");
      }

      setAnalysisResult({
        summary: data.summary,
        prompt: data.prompt,
        fileName: uploaded?.name,
      });

      toast.success("Document analyzed successfully.");
      return { ...data, fileName: uploaded?.name };
    } catch (error) {
      console.error("File analysis failed:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to analyze the uploaded document.",
      );
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [startUpload]);

  const clearAnalysis = useCallback(() => {
    setAnalysisResult(null);
  }, []);

  return {
    analyzeFiles,
    isAnalyzing,
    analysisResult,
    clearAnalysis,
  };
}
