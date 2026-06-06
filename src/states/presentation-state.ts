import { useRef, useSyncExternalStore } from "react";
import { useSlidesStore, type SlidesState } from "./slides-store";
import { useGenerationStore, type GenerationState } from "./generation-store";
import { useUIStore, type UIState } from "./ui-store";
import { useSettingsStore, type SettingsState } from "./settings-store";

export type HistoryType = "history";
export type ImageEditorMode =
  | "generate"
  | "your-images"
  | "embed"
  | "search"
  | "gif"
  | "chart";

export type RightPanelType =
  | "elements"
  | "charts"
  | "embed"
  | "background"
  | "theme"
  | "agent"
  | "globalSettings"
  | "imageEditor"
  | "chartEditor"
  | "infographicEditor"
  | "presentationImageEditor"
  | null;

export type PresentationState =
  SlidesState &
  GenerationState &
  UIState &
  SettingsState & {
    resetForNewGeneration: () => void;
    resetPresentationState: () => void;
  };

export { useSlidesStore } from "./slides-store";
export { useGenerationStore } from "./generation-store";
export { useUIStore } from "./ui-store";
export { useSettingsStore } from "./settings-store";

const getMergedState = (): PresentationState => ({
  ...useSlidesStore.getState(),
  ...useGenerationStore.getState(),
  ...useUIStore.getState(),
  ...useSettingsStore.getState(),
  resetForNewGeneration,
  resetPresentationState,
});

function resetForNewGeneration() {
  useSlidesStore.setState({
    slides: [],
    rootImageGeneration: {},
  });

  useGenerationStore.setState({
    shouldStartOutlineGeneration: false,
    shouldStartPresentationGeneration: false,
    shouldStartImageSlideGeneration: false,
    isGeneratingOutline: false,
    isGeneratingPresentation: false,
    outline: [],
    searchResults: [],
  });

  useUIStore.setState({
    activeRightPanel: null,
    pendingAgentMessage: null,
    imageEditorInitialMode: null,
    presentationImageEditorInitialMode: null,
    boundUpdateElement: null,
    generatedImageCache: {},
    isReadOnly: false,
  });

  useSettingsStore.setState({
    pageBackground: {},
    selectedSlideTemplates: [],
    outlineTemplateOverrides: {},
    thumbnailUrl: undefined,
  });
}

function resetPresentationState() {
  useSlidesStore.setState({
    slides: [],
    currentSlideId: null,
    rootImageGeneration: {},
  });

  useGenerationStore.setState({
    shouldStartOutlineGeneration: false,
    shouldStartPresentationGeneration: false,
    shouldStartImageSlideGeneration: false,
    isGeneratingOutline: false,
    isGeneratingPresentation: false,
    pendingCreateRequest: null,
    outline: [],
    searchResults: [],
  });

  useUIStore.setState({
    activeRightPanel: null,
    pendingAgentMessage: null,
    imageEditorInitialMode: null,
    presentationImageEditorInitialMode: null,
    presentationImageElementId: null,
    boundUpdateElement: null,
    isSidebarCollapsed: false,
    isRightPanelCollapsed: false,
    selectedPresentations: [],
    isSelecting: false,
    savingStatus: "idle",
    isReadOnly: false,
    isPresenting: false,
    isPresentingLoading: false,
    presentingScaleLocks: {},
    shouldShowExitHeader: false,
  });

  useSettingsStore.setState({
    currentPresentationId: null,
    currentPresentationTitle: null,
    presentationInput: "",
    pageBackground: {},
    thumbnailUrl: undefined,
    selectedSlideTemplates: [],
    outlineTemplateOverrides: {},
  });
}

const slidesKeys = new Set<keyof SlidesState>([
  "slides",
  "currentSlideId",
  "rootImageGeneration",
  "setSlides",
  "updateSlide",
  "setCurrentSlideId",
  "nextSlide",
  "previousSlide",
  "startRootImageGeneration",
  "completeRootImageGeneration",
  "failRootImageGeneration",
  "clearRootImageGeneration",
]);

const generationKeys = new Set<keyof GenerationState>([
  "numSlides",
  "shouldStartOutlineGeneration",
  "shouldStartPresentationGeneration",
  "shouldStartImageSlideGeneration",
  "isGeneratingOutline",
  "isGeneratingPresentation",
  "pendingCreateRequest",
  "outline",
  "searchResults",
  "webSearchEnabled",
  "setNumSlides",
  "setShouldStartOutlineGeneration",
  "setShouldStartPresentationGeneration",
  "setShouldStartImageSlideGeneration",
  "setIsGeneratingOutline",
  "setIsGeneratingPresentation",
  "setPendingCreateRequest",
  "consumePendingCreateRequest",
  "setOutline",
  "setSearchResults",
  "setWebSearchEnabled",
  "startOutlineGeneration",
  "startPresentationGeneration",
  "startImageSlideGeneration",
  "resetGeneration",
]);

const uiKeys = new Set<keyof UIState>([
  "isGridView",
  "isSheetOpen",
  "isSidebarCollapsed",
  "isRightPanelCollapsed",
  "isPresenting",
  "isPresentingLoading",
  "presentingScaleLocks",
  "isThemeCreatorOpen",
  "shouldShowExitHeader",
  "savingStatus",
  "isSelecting",
  "selectedPresentations",
  "activeRightPanel",
  "pendingAgentMessage",
  "imageEditorInitialMode",
  "presentationImageEditorInitialMode",
  "presentationImageElementId",
  "boundUpdateElement",
  "chartEditorData",
  "isReorderingSlides",
  "generatedImageCache",
  "imageSearchState",
  "zoomLevel",
  "isReadOnly",
  "openImageEditor",
  "closeImageEditor",
  "openChartEditor",
  "closeChartEditor",
  "openInfographicEditor",
  "closeInfographicEditor",
  "openPresentationImageEditor",
  "closePresentationImageEditor",
  "setIsGridView",
  "setIsSheetOpen",
  "setIsSidebarCollapsed",
  "setIsRightPanelCollapsed",
  "setIsPresenting",
  "resetPresentMode",
  "setIsPresentingLoading",
  "setPresentingScaleLock",
  "resetPresentingScaleLocks",
  "setIsThemeCreatorOpen",
  "setShouldShowExitHeader",
  "setSavingStatus",
  "toggleSelecting",
  "selectAllPresentations",
  "deselectAllPresentations",
  "togglePresentationSelection",
  "setActiveRightPanel",
  "setPendingAgentMessage",
  "setGeneratedImageCache",
  "setImageSearchState",
  "setIsReorderingSlides",
  "setZoomLevel",
  "setIsReadOnly",
]);

const settingsKeys = new Set<keyof SettingsState>([
  "currentPresentationId",
  "currentPresentationTitle",
  "theme",
  "customThemeData",
  "language",
  "pageStyle",
  "showTemplates",
  "presentationInput",
  "imageModel",
  "imageSource",
  "stockImageProvider",
  "presentationStyle",
  "modelProvider",
  "modelId",
  "textContent",
  "tone",
  "audience",
  "scenario",
  "pageBackground",
  "thumbnailUrl",
  "selectedSlideTemplates",
  "outlineTemplateOverrides",
  "setCurrentPresentation",
  "setTheme",
  "setLanguage",
  "setPageStyle",
  "setShowTemplates",
  "setPresentationInput",
  "setImageModel",
  "setImageSource",
  "setStockImageProvider",
  "setPresentationStyle",
  "setModelProvider",
  "setModelId",
  "setTextContent",
  "setTone",
  "setAudience",
  "setScenario",
  "setPageBackground",
  "setThumbnailUrl",
  "setSelectedSlideTemplates",
  "setOutlineTemplateOverride",
  "clearOutlineTemplateOverrides",
]);

const setPartialState = (
  patch: Partial<PresentationState>,
  keys: Set<string>,
  store: { setState: (partial: Partial<unknown>, replace?: boolean) => void },
  replace: boolean,
) => {
  const partialState: Record<string, unknown> = {};
  let hasPatch = false;

  for (const key of Object.keys(patch)) {
    if (keys.has(key)) {
      partialState[key] = (patch as any)[key];
      hasPatch = true;
    }
  }

  if (hasPatch) {
    store.setState(partialState, replace);
  }
};

export type UsePresentationState = {
  <T>(selector: (state: PresentationState) => T): T;
  (): PresentationState;
  getState: () => PresentationState;
  setState: (
    partial:
      | Partial<PresentationState>
      | ((state: PresentationState) => Partial<PresentationState>),
    replace?: boolean,
  ) => void;
};

const usePresentationState = Object.assign(
  (
    selector: (state: PresentationState) => unknown =
      ((state: PresentationState) => state) as (state: PresentationState) => unknown,
  ) => {
    const cacheRef = useRef<{
      slidesState: ReturnType<typeof useSlidesStore["getState"]>;
      generationState: ReturnType<typeof useGenerationStore["getState"]>;
      uiState: ReturnType<typeof useUIStore["getState"]>;
      settingsState: ReturnType<typeof useSettingsStore["getState"]>;
      mergedState: PresentationState;
      selectedSnapshot: unknown;
    } | null>(null);

    const subscribe = (callback: () => void) => {
      const unsubscribeFns = [
        useSlidesStore.subscribe(callback),
        useGenerationStore.subscribe(callback),
        useUIStore.subscribe(callback),
        useSettingsStore.subscribe(callback),
      ];
      return () => unsubscribeFns.forEach((unsubscribe) => unsubscribe());
    };

    const isShallowEqual = (a: unknown, b: unknown): boolean => {
      if (Object.is(a, b)) {
        return true;
      }

      if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) {
        return false;
      }

      if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) {
          return false;
        }
        for (let i = 0; i < a.length; i += 1) {
          if (!Object.is(a[i], b[i])) {
            return false;
          }
        }
        return true;
      }

      const aKeys = Object.keys(a as Record<string, unknown>);
      const bKeys = Object.keys(b as Record<string, unknown>);
      if (aKeys.length !== bKeys.length) {
        return false;
      }
      for (const key of aKeys) {
        if (!Object.prototype.hasOwnProperty.call(b, key)) {
          return false;
        }
        if (!Object.is((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
          return false;
        }
      }
      return true;
    };

    const getMergedSnapshot = () => {
      const slidesState = useSlidesStore.getState();
      const generationState = useGenerationStore.getState();
      const uiState = useUIStore.getState();
      const settingsState = useSettingsStore.getState();

      const cached = cacheRef.current;
      if (
        cached &&
        cached.slidesState === slidesState &&
        cached.generationState === generationState &&
        cached.uiState === uiState &&
        cached.settingsState === settingsState
      ) {
        return cached;
      }

      const mergedState = {
        ...slidesState,
        ...generationState,
        ...uiState,
        ...settingsState,
        resetForNewGeneration,
        resetPresentationState,
      } as PresentationState;

      cacheRef.current = {
        slidesState,
        generationState,
        uiState,
        settingsState,
        mergedState,
        selectedSnapshot: undefined,
      };

      return cacheRef.current;
    };

    const getSnapshot = () => {
      const cached = getMergedSnapshot();
      const nextSnapshot = selector(cached.mergedState);
      if (isShallowEqual(cached.selectedSnapshot, nextSnapshot)) {
        return cached.selectedSnapshot;
      }
      cached.selectedSnapshot = nextSnapshot;
      return nextSnapshot;
    };

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot) as unknown;
  },
  {
    getState: getMergedState,
    setState: (
      partialOrUpdater:
        | Partial<PresentationState>
        | ((state: PresentationState) => Partial<PresentationState>),
      replace = false,
    ) => {
      const currentState = getMergedState();
      const patch =
        typeof partialOrUpdater === "function"
          ? partialOrUpdater(currentState)
          : partialOrUpdater;

      setPartialState(patch, slidesKeys, useSlidesStore, replace);
      setPartialState(patch, generationKeys, useGenerationStore, replace);
      setPartialState(patch, uiKeys, useUIStore, replace);
      setPartialState(patch, settingsKeys, useSettingsStore, replace);
    },
  },
) as UsePresentationState;

export { usePresentationState };
