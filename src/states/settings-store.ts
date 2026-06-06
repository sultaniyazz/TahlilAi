import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { ThemeProperties, Themes } from "@/lib/presentation/themes";
import type { ImageModelList } from "@/app/_actions/apps/image-studio/generate";
import type { HistoryType } from "./presentation-state";

export interface SettingsState {
  currentPresentationId: string | null;
  currentPresentationTitle: string | null;
  theme: Themes | string;
  customThemeData: ThemeProperties | null;
  language: string;
  pageStyle: string;
  showTemplates: boolean;
  presentationInput: string;
  imageModel: ImageModelList;
  imageSource: "automatic" | "ai" | "stock";
  stockImageProvider: "unsplash" | "pixabay";
  presentationStyle: string;
  modelProvider: "openai" | "ollama" | "lmstudio" | "openrouter";
  modelId: string;
  textContent: "minimal" | "ixcham" | "batafsil" | "keng qamrovli";
  tone:
    | "auto"
    | "general"
    | "persuasive"
    | "inspiring"
    | "instructive"
    | "engaging";
  audience:
    | "auto"
    | "general"
    | "business"
    | "investor"
    | "teacher"
    | "student";
  scenario:
    | "auto"
    | "general"
    | "analysis-report"
    | "teaching-training"
    | "promotional-materials"
    | "public-speeches";
  pageBackground: Record<string, unknown>;
  thumbnailUrl?: string;
  selectedSlideTemplates: string[];
  outlineTemplateOverrides: Record<string, string | null>;
  setCurrentPresentation: (id: string | null, title: string | null) => void;
  setTheme: (
    theme: Themes | string,
    customData?: ThemeProperties | null,
    type?: HistoryType,
  ) => void;
  setLanguage: (lang: string) => void;
  setPageStyle: (style: string) => void;
  setShowTemplates: (show: boolean) => void;
  setPresentationInput: (input: string) => void;
  setImageModel: (model: ImageModelList) => void;
  setImageSource: (source: "automatic" | "ai" | "stock") => void;
  setStockImageProvider: (provider: "unsplash" | "pixabay") => void;
  setPresentationStyle: (style: string) => void;
  setModelProvider: (provider: "openai" | "ollama" | "lmstudio" | "openrouter") => void;
  setModelId: (id: string) => void;
  setTextContent: (
    content: "minimal" | "ixcham" | "batafsil" | "keng qamrovli",
  ) => void;
  setTone: (
    tone:
      | "auto"
      | "general"
      | "persuasive"
      | "inspiring"
      | "instructive"
      | "engaging",
  ) => void;
  setAudience: (
    audience:
      | "auto"
      | "general"
      | "business"
      | "investor"
      | "teacher"
      | "student",
  ) => void;
  setScenario: (
    scenario:
      | "auto"
      | "general"
      | "analysis-report"
      | "teaching-training"
      | "promotional-materials"
      | "public-speeches",
  ) => void;
  setPageBackground: (pageBackground: Record<string, unknown>) => void;
  setThumbnailUrl: (url: string | undefined) => void;
  setSelectedSlideTemplates: (templates: string[]) => void;
  setOutlineTemplateOverride: (outlineId: string, templateId: string | null) => void;
  clearOutlineTemplateOverrides: () => void;
}

const pushHistorySnapshot = (
  type: HistoryType | undefined,
  slideId: string | undefined,
  changeType: "slide" | "theme" | "full" = "full",
) => {
  if (type === "history") return;
  const { pushSnapshot, history } = (require("./presentation-history-state") as typeof import("./presentation-history-state")).usePresentationHistoryState.getState();
  if (history.present !== null) {
    pushSnapshot(slideId, changeType);
  }
};

export const useSettingsStore = create<SettingsState>()(
  subscribeWithSelector((set) => ({
    currentPresentationId: null,
    currentPresentationTitle: null,
    theme: "mystique",
    customThemeData: null,
    language: "en-US",
    pageStyle: "default",
    showTemplates: false,
    presentationInput: "",
    imageModel: "fal-ai/flux-2/flash",
    imageSource: "automatic",
    stockImageProvider: "unsplash",
    presentationStyle: "professional",
    modelProvider: "openrouter",
    modelId: "",
    textContent: "ixcham",
    tone: "auto",
    audience: "auto",
    scenario: "auto",
    pageBackground: {},
    thumbnailUrl: undefined,
    selectedSlideTemplates: [],
    outlineTemplateOverrides: {},
    setCurrentPresentation: (id, title) =>
      set({ currentPresentationId: id, currentPresentationTitle: title }),
    setTheme: (theme, customData = null, type) => {
      set({ theme, customThemeData: customData });
      if (type !== "history") {
        pushHistorySnapshot(type, undefined, "theme");
      }
    },
    setLanguage: (lang) => set({ language: lang }),
    setPageStyle: (style) => set({ pageStyle: style }),
    setShowTemplates: (show) => set({ showTemplates: show }),
    setPresentationInput: (input) => set({ presentationInput: input }),
    setImageModel: (model: ImageModelList) => set({ imageModel: model }),
    setImageSource: (source) => set({ imageSource: source }),
    setStockImageProvider: (provider) => set({ stockImageProvider: provider }),
    setPresentationStyle: (style) => set({ presentationStyle: style }),
    setModelProvider: (provider) => set({ modelProvider: provider }),
    setModelId: (id) => set({ modelId: id }),
    setTextContent: (content) => set({ textContent: content }),
    setTone: (tone) => set({ tone }),
    setAudience: (audience) => set({ audience }),
    setScenario: (scenario) => set({ scenario }),
    setPageBackground: (pageBackground) => set({ pageBackground }),
    setThumbnailUrl: (url) => set({ thumbnailUrl: url }),
    setSelectedSlideTemplates: (templates) =>
      set({ selectedSlideTemplates: templates }),
    setOutlineTemplateOverride: (outlineId, templateId) =>
      set((state) => ({
        outlineTemplateOverrides: {
          ...state.outlineTemplateOverrides,
          [outlineId]: templateId,
        },
      })),
    clearOutlineTemplateOverrides: () => set({ outlineTemplateOverrides: {} }),
  })),
);
