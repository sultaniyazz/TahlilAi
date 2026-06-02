"use client";

import { usePresentationState } from "@/states/presentation-state";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const MAX_PROMPT_LENGTH = 1200;

export function useLandingCreate() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const {
    presentationInput,
    setPresentationInput,
    language,
    setLanguage,
    modelId,
    modelProvider,
    numSlides,
    setNumSlides,
    webSearchEnabled,
    setWebSearchEnabled,
    setPendingCreateRequest,
    resetPresentationState,
  } = usePresentationState();

  const createPresentation = async () => {
    const prompt = presentationInput.trim();
    if (!prompt) {
      return;
    }

    setIsCreating(true);
    const selectedLanguage = language;
    const selectedNumSlides = numSlides;
    const selectedWebSearchEnabled = webSearchEnabled;

    resetPresentationState();

    try {
      setPendingCreateRequest({
        prompt,
        language: selectedLanguage,
        modelId,
        modelProvider,
        numSlides: selectedNumSlides,
        webSearchEnabled: selectedWebSearchEnabled,
      });
      router.push("/presentation/create");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create presentation");
    } finally {
      setIsCreating(false);
    }
  };

  const applyExample = (prompt: string, slides: number, exampleLanguage: string) => {
    setPresentationInput(prompt.slice(0, MAX_PROMPT_LENGTH));
    setNumSlides(slides);
    setLanguage(exampleLanguage);
  };

  return {
    presentationInput,
    setPresentationInput: (value: string) =>
      setPresentationInput(value.slice(0, MAX_PROMPT_LENGTH)),
    language,
    setLanguage,
    numSlides,
    setNumSlides,
    webSearchEnabled,
    setWebSearchEnabled,
    isCreating,
    createPresentation,
    applyExample,
    maxPromptLength: MAX_PROMPT_LENGTH,
  };
}
