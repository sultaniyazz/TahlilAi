import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { Image as GeneratedImage } from "@/app/_actions/apps/image-studio/fetch";
import type { ImageEditorMode, RightPanelType } from "@/states/presentation-state";

export interface UIState {
  isGridView: boolean;
  isSheetOpen: boolean;
  isSidebarCollapsed: boolean;
  isRightPanelCollapsed: boolean;
  isPresenting: boolean;
  isPresentingLoading: boolean;
  presentingScaleLocks: Record<string, boolean>;
  isThemeCreatorOpen: boolean;
  shouldShowExitHeader: boolean;
  savingStatus: "idle" | "saving" | "saved";
  isSelecting: boolean;
  selectedPresentations: string[];
  activeRightPanel: RightPanelType;
  pendingAgentMessage:
    | { message: string; slideContext: string }
    | null;
  imageEditorInitialMode: ImageEditorMode | null;
  presentationImageEditorInitialMode: ImageEditorMode | null;
  presentationImageElementId: string | null;
  boundUpdateElement: ((props: Record<string, unknown>) => void) | null;
  chartEditorData:
    | {
        chartType: string;
        chartData: unknown;
        chartOptions: Record<string, unknown>;
      }
    | null;
  isReorderingSlides: boolean;
  generatedImageCache: Record<string, GeneratedImage[]>;
  imageSearchState: {
    mode: "unsplash" | "pixabay";
    unsplashQuery: string;
    pixabayQuery: string;
  };
  zoomLevel: number;
  isReadOnly: boolean;
  openImageEditor: (mode?: ImageEditorMode) => void;
  closeImageEditor: () => void;
  openChartEditor: (
    chartData?: {
      chartType: string;
      chartData: unknown;
      chartOptions: Record<string, unknown>;
    },
    updateElementFn?: (props: Record<string, unknown>) => void,
  ) => void;
  closeChartEditor: () => void;
  openInfographicEditor: (
    updateElementFn?: (props: Record<string, unknown>) => void,
  ) => void;
  closeInfographicEditor: () => void;
  openPresentationImageEditor: (
    mode?: ImageEditorMode,
    updateElementFn?: (props: Record<string, unknown>) => void,
  ) => void;
  closePresentationImageEditor: () => void;
  setIsGridView: (isGrid: boolean) => void;
  setIsSheetOpen: (isOpen: boolean) => void;
  setIsSidebarCollapsed: (update: boolean) => void;
  setIsRightPanelCollapsed: (update: boolean) => void;
  setIsPresenting: (isPresenting: boolean) => void;
  resetPresentMode: () => void;
  setIsPresentingLoading: (isLoading: boolean) => void;
  setPresentingScaleLock: (slideId: string, locked: boolean) => void;
  resetPresentingScaleLocks: () => void;
  setIsThemeCreatorOpen: (update: boolean) => void;
  setShouldShowExitHeader: (update: boolean) => void;
  setSavingStatus: (status: "idle" | "saving" | "saved") => void;
  toggleSelecting: () => void;
  selectAllPresentations: (ids: string[]) => void;
  deselectAllPresentations: () => void;
  togglePresentationSelection: (id: string) => void;
  setActiveRightPanel: (panel: RightPanelType) => void;
  setPendingAgentMessage: (
    pending: { message: string; slideContext: string } | null,
  ) => void;
  setGeneratedImageCache: (prompt: string, images: GeneratedImage[]) => void;
  setImageSearchState: (
    state: Partial<{
      mode: "unsplash" | "pixabay";
      unsplashQuery: string;
      pixabayQuery: string;
    }>,
  ) => void;
  setIsReorderingSlides: (isReordering: boolean) => void;
  setZoomLevel: (level: number) => void;
  setIsReadOnly: (isReadOnly: boolean) => void;
}

export const useUIStore = create<UIState>()(
  subscribeWithSelector((set) => ({
    isGridView: true,
    isSheetOpen: false,
    isSidebarCollapsed: false,
    isRightPanelCollapsed: false,
    isPresenting: false,
    isPresentingLoading: false,
    presentingScaleLocks: {},
    isThemeCreatorOpen: false,
    shouldShowExitHeader: false,
    savingStatus: "idle",
    isSelecting: false,
    selectedPresentations: [],
    activeRightPanel: null,
    pendingAgentMessage: null,
    imageEditorInitialMode: null,
    presentationImageEditorInitialMode: null,
    presentationImageElementId: null,
    boundUpdateElement: null,
    chartEditorData: null,
    isReorderingSlides: false,
    generatedImageCache: {},
    imageSearchState: {
      mode: "unsplash",
      unsplashQuery: "",
      pixabayQuery: "",
    },
    zoomLevel: 1,
    isReadOnly: false,
    openImageEditor: (mode = "generate") =>
      set({
        imageEditorInitialMode: mode,
        activeRightPanel: "imageEditor",
      }),
    closeImageEditor: () =>
      set((state) => ({
        imageEditorInitialMode: null,
        activeRightPanel:
          state.activeRightPanel === "imageEditor"
            ? null
            : state.activeRightPanel,
      })),
    openChartEditor: (chartData, updateElementFn) =>
      set({
        activeRightPanel: "chartEditor",
        chartEditorData: chartData ?? null,
        boundUpdateElement: updateElementFn ?? null,
      }),
    closeChartEditor: () =>
      set((state) => ({
        activeRightPanel:
          state.activeRightPanel === "chartEditor"
            ? null
            : state.activeRightPanel,
        chartEditorData: null,
        boundUpdateElement:
          state.activeRightPanel === "chartEditor"
            ? null
            : state.boundUpdateElement,
      })),
    openInfographicEditor: (updateElementFn) =>
      set({
        activeRightPanel: "infographicEditor",
        boundUpdateElement: updateElementFn ?? null,
      }),
    closeInfographicEditor: () =>
      set((state) => ({
        activeRightPanel:
          state.activeRightPanel === "infographicEditor"
            ? null
            : state.activeRightPanel,
        boundUpdateElement:
          state.activeRightPanel === "infographicEditor"
            ? null
            : state.boundUpdateElement,
      })),
    openPresentationImageEditor: (mode = "generate", updateElementFn) =>
      set({
        presentationImageEditorInitialMode: mode,
        activeRightPanel: "presentationImageEditor",
        boundUpdateElement: updateElementFn ?? null,
      }),
    closePresentationImageEditor: () =>
      set((state) => ({
        presentationImageEditorInitialMode: null,
        boundUpdateElement: null,
        activeRightPanel:
          state.activeRightPanel === "presentationImageEditor"
            ? null
            : state.activeRightPanel,
      })),
    setIsGridView: (isGrid) => set({ isGridView: isGrid }),
    setIsSheetOpen: (isOpen) => set({ isSheetOpen: isOpen }),
    setIsSidebarCollapsed: (update) => set({ isSidebarCollapsed: update }),
    setIsRightPanelCollapsed: (update) =>
      set({ isRightPanelCollapsed: update }),
    setIsPresenting: (isPresenting) =>
      set(() =>
        isPresenting
          ? { isPresenting: true, shouldShowExitHeader: false }
          : {
              isPresenting: false,
              isPresentingLoading: false,
              presentingScaleLocks: {},
              shouldShowExitHeader: false,
            },
      ),
    resetPresentMode: () =>
      set({
        isPresenting: false,
        isPresentingLoading: false,
        presentingScaleLocks: {},
        shouldShowExitHeader: false,
      }),
    setIsPresentingLoading: (isLoading) =>
      set({ isPresentingLoading: isLoading }),
    setPresentingScaleLock: (slideId, locked) =>
      set((state) => ({
        presentingScaleLocks: {
          ...state.presentingScaleLocks,
          [slideId]: locked,
        },
      })),
    resetPresentingScaleLocks: () => set({ presentingScaleLocks: {} }),
    setIsThemeCreatorOpen: (update) => set({ isThemeCreatorOpen: update }),
    setShouldShowExitHeader: (update) =>
      set({ shouldShowExitHeader: update }),
    setSavingStatus: (status) => set({ savingStatus: status }),
    toggleSelecting: () =>
      set((state) => ({
        isSelecting: !state.isSelecting,
        selectedPresentations: [],
      })),
    selectAllPresentations: (ids) => set({ selectedPresentations: ids }),
    deselectAllPresentations: () => set({ selectedPresentations: [] }),
    togglePresentationSelection: (id) =>
      set((state) => ({
        selectedPresentations: state.selectedPresentations.includes(id)
          ? state.selectedPresentations.filter((presentationId) =>
              presentationId !== id,
            )
          : [...state.selectedPresentations, id],
      })),
    setActiveRightPanel: (panel) => set({ activeRightPanel: panel }),
    setPendingAgentMessage: (pending) => set({ pendingAgentMessage: pending }),
    setGeneratedImageCache: (prompt, images) =>
      set((state) => ({
        generatedImageCache: {
          ...state.generatedImageCache,
          [prompt]: images,
        },
      })),
    setImageSearchState: (newState) =>
      set((state) => ({
        imageSearchState: {
          ...state.imageSearchState,
          ...newState,
        },
      })),
    setIsReorderingSlides: (isReordering) =>
      set({ isReorderingSlides: isReordering }),
    setZoomLevel: (level) => set({ zoomLevel: level }),
    setIsReadOnly: (isReadOnly) => set({ isReadOnly }),
  })),
);
