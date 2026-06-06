import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useSlidesStore } from "./slides-store";

export interface PendingPresentationCreateRequest {
  language: string;
  modelId: string;
  modelProvider: "openai" | "ollama" | "lmstudio" | "openrouter";
  numSlides: number;
  prompt: string;
  webSearchEnabled: boolean;
}

export interface GenerationState {
  numSlides: number;
  shouldStartOutlineGeneration: boolean;
  shouldStartPresentationGeneration: boolean;
  shouldStartImageSlideGeneration: boolean;
  isGeneratingOutline: boolean;
  isGeneratingPresentation: boolean;
  pendingCreateRequest: PendingPresentationCreateRequest | null;
  outline: string[];
  searchResults: Array<{ query: string; results: unknown[] }>;
  webSearchEnabled: boolean;
  setNumSlides: (numSlides: number) => void;
  setShouldStartOutlineGeneration: (shouldStart: boolean) => void;
  setShouldStartPresentationGeneration: (shouldStart: boolean) => void;
  setShouldStartImageSlideGeneration: (shouldStart: boolean) => void;
  setIsGeneratingOutline: (isGenerating: boolean) => void;
  setIsGeneratingPresentation: (isGenerating: boolean) => void;
  setPendingCreateRequest: (
    request: PendingPresentationCreateRequest | null,
  ) => void;
  consumePendingCreateRequest: () => PendingPresentationCreateRequest | null;
  setOutline: (outline: string[]) => void;
  setSearchResults: (results: Array<{ query: string; results: unknown[] }>) => void;
  setWebSearchEnabled: (enabled: boolean) => void;
  startOutlineGeneration: () => void;
  startPresentationGeneration: () => void;
  startImageSlideGeneration: () => void;
  resetGeneration: () => void;
}

export const useGenerationStore = create<GenerationState>()(
  subscribeWithSelector((set, get) => ({
    numSlides: 5,
    shouldStartOutlineGeneration: false,
    shouldStartPresentationGeneration: false,
    shouldStartImageSlideGeneration: false,
    isGeneratingOutline: false,
    isGeneratingPresentation: false,
    pendingCreateRequest: null,
    outline: [],
    searchResults: [],
    webSearchEnabled: false,
    setNumSlides: (numSlides) => set({ numSlides }),
    setShouldStartOutlineGeneration: (shouldStart) =>
      set({ shouldStartOutlineGeneration: shouldStart }),
    setShouldStartPresentationGeneration: (shouldStart) =>
      set({ shouldStartPresentationGeneration: shouldStart }),
    setShouldStartImageSlideGeneration: (shouldStart) =>
      set({ shouldStartImageSlideGeneration: shouldStart }),
    setIsGeneratingOutline: (isGenerating) =>
      set({ isGeneratingOutline: isGenerating }),
    setIsGeneratingPresentation: (isGenerating) =>
      set({ isGeneratingPresentation: isGenerating }),
    setPendingCreateRequest: (request) => set({ pendingCreateRequest: request }),
    consumePendingCreateRequest: () => {
      const pendingCreateRequest = get().pendingCreateRequest;
      if (!pendingCreateRequest) {
        return null;
      }
      set({ pendingCreateRequest: null });
      return pendingCreateRequest;
    },
    setOutline: (outline) => set({ outline }),
    setSearchResults: (searchResults) => set({ searchResults }),
    setWebSearchEnabled: (enabled) => set({ webSearchEnabled: enabled }),
    startOutlineGeneration: () =>
      set({
        shouldStartOutlineGeneration: true,
        isGeneratingOutline: true,
        shouldStartPresentationGeneration: false,
        isGeneratingPresentation: false,
        outline: [],
        searchResults: [],
      }),
    startPresentationGeneration: () => {
      const state = get();
      if (state.outline.some((item) => item.trim().length > 0)) {
        useSlidesStore.setState({ slides: [] });
        set({
          shouldStartPresentationGeneration: true,
          isGeneratingPresentation: true,
        });
      } else {
        set({
          shouldStartPresentationGeneration: false,
          isGeneratingPresentation: false,
        });
      }
    },
    startImageSlideGeneration: () => {
      const state = get();
      if (state.outline.some((item) => item.trim().length > 0)) {
        useSlidesStore.setState({ slides: [] });
        set({
          shouldStartImageSlideGeneration: true,
          isGeneratingPresentation: true,
        });
      } else {
        set({
          shouldStartImageSlideGeneration: false,
          isGeneratingPresentation: false,
        });
      }
    },
    resetGeneration: () =>
      set({
        shouldStartOutlineGeneration: false,
        shouldStartPresentationGeneration: false,
        shouldStartImageSlideGeneration: false,
        isGeneratingOutline: false,
        isGeneratingPresentation: false,
        searchResults: [],
      }),
  })),
);
