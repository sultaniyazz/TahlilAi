import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { PlateSlide } from "@/components/notebook/presentation/utils/parser";
import type { HistoryType } from "./presentation-state";

export type RootImageGenerationState = Record<
  string,
  {
    query: string;
    status: "queued" | "generating" | "success" | "error";
    url?: string;
    error?: string;
  }
>;

export interface SlidesState {
  slides: PlateSlide[];
  currentSlideId: string | null;
  rootImageGeneration: RootImageGenerationState;
  setSlides: (
    slides: PlateSlide[] | ((slides: PlateSlide[]) => PlateSlide[]),
    type?: HistoryType,
  ) => void;
  updateSlide: (
    slideId: string,
    updates: Partial<PlateSlide>,
    type?: HistoryType,
  ) => void;
  setCurrentSlideId: (id: string | null) => void;
  nextSlide: () => void;
  previousSlide: () => void;
  startRootImageGeneration: (slideId: string, query: string) => void;
  completeRootImageGeneration: (slideId: string, url: string) => void;
  failRootImageGeneration: (slideId: string, error: string) => void;
  clearRootImageGeneration: (slideId: string) => void;
}

const pushHistorySnapshot = (
  type: HistoryType | undefined,
  slideId?: string,
  changeType: "slide" | "full" = "full",
) => {
  if (type === "history") return;
  const { pushSnapshot, history } = (require("./presentation-history-state") as typeof import("./presentation-history-state")).usePresentationHistoryState.getState();
  if (history.present !== null) {
    pushSnapshot(slideId, changeType);
  }
};

export const useSlidesStore = create<SlidesState>()(
  subscribeWithSelector((set, get) => ({
    slides: [],
    currentSlideId: null,
    rootImageGeneration: {},
    setSlides: (slides, type) => {
      set((state) => ({
        slides:
          typeof slides === "function" ? slides(state.slides) : slides,
      }));
      pushHistorySnapshot(type, undefined, "full");
    },
    updateSlide: (slideId, updates, type) => {
      set((state) => ({
        slides: state.slides.map((slide) =>
          slide.id === slideId ? { ...slide, ...updates } : slide,
        ),
      }));
      pushHistorySnapshot(type, slideId, "slide");
    },
    setCurrentSlideId: (id) => set({ currentSlideId: id }),
    nextSlide: () =>
      set((state) => {
        const currentIndex = state.slides.findIndex(
          (slide) => slide.id === state.currentSlideId,
        );
        const newIndex = Math.min(
          (currentIndex === -1 ? 0 : currentIndex) + 1,
          state.slides.length - 1,
        );
        return { currentSlideId: state.slides[newIndex]?.id ?? null };
      }),
    previousSlide: () =>
      set((state) => {
        const currentIndex = state.slides.findIndex(
          (slide) => slide.id === state.currentSlideId,
        );
        const newIndex = Math.max(
          (currentIndex === -1 ? 0 : currentIndex) - 1,
          0,
        );
        return { currentSlideId: state.slides[newIndex]?.id ?? null };
      }),
    startRootImageGeneration: (slideId, query) =>
      set((state) => ({
        rootImageGeneration: {
          ...state.rootImageGeneration,
          [slideId]: { query, status: "queued" },
        },
      })),
    completeRootImageGeneration: (slideId, url) =>
      set((state) => ({
        rootImageGeneration: {
          ...state.rootImageGeneration,
          [slideId]: {
            ...(state.rootImageGeneration[slideId] ?? { query: "" }),
            status: "success",
            url,
          },
        },
      })),
    failRootImageGeneration: (slideId, error) =>
      set((state) => ({
        rootImageGeneration: {
          ...state.rootImageGeneration,
          [slideId]: {
            ...(state.rootImageGeneration[slideId] ?? { query: "" }),
            status: "error",
            error,
          },
        },
      })),
    clearRootImageGeneration: (slideId) =>
      set((state) => {
        const { [slideId]: _removed, ...rest } = state.rootImageGeneration;
        return { rootImageGeneration: rest };
      }),
  })),
);
