import { create } from 'zustand';
import type { Slide, SlideElement, CanvasSettings, Theme, Project } from '@/types';
import { DEFAULT_CANVAS, DEFAULT_THEME } from '@/types';

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

interface HistoryEntry {
  slides: Slide[];
}

interface EditorState {
  project: Project | null;
  slides: Slide[];
  activeSlideIndex: number;
  selectedElementId: string | null;
  canvasSettings: CanvasSettings;
  theme: Theme;
  zoom: number;
  history: HistoryEntry[];
  historyIndex: number;

  setProject: (p: Project | null) => void;
  setSlides: (slides: Slide[]) => void;
  setTheme: (theme: Theme) => void;
  setActiveSlide: (i: number) => void;
  setZoom: (z: number) => void;

  addSlide: (slide?: Partial<Slide>) => void;
  duplicateSlide: (i: number) => void;
  deleteSlide: (i: number) => void;
  reorderSlides: (ids: string[]) => void;
  updateSlide: (i: number, updates: Partial<Slide>) => void;

  selectElement: (id: string | null) => void;
  addElement: (element: Omit<SlideElement, 'id' | 'zIndex'>) => void;
  updateElement: (id: string, updates: Partial<SlideElement>) => void;
  removeElement: (id: string) => void;

  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  pushHistory: () => void;
}

const cloneSlides = (s: Slide[]) => JSON.parse(JSON.stringify(s)) as Slide[];

export const useEditorStore = create<EditorState>((set, get) => ({
  project: null,
  slides: [],
  activeSlideIndex: 0,
  selectedElementId: null,
  canvasSettings: DEFAULT_CANVAS,
  theme: DEFAULT_THEME,
  zoom: 60,
  history: [],
  historyIndex: -1,

  setProject: (project) => {
    if (project) {
      set({
        project,
        slides: project.slides ?? [],
        canvasSettings: project.canvasSettings ?? DEFAULT_CANVAS,
        theme: project.theme ?? DEFAULT_THEME,
        activeSlideIndex: 0,
        history: [{ slides: cloneSlides(project.slides ?? []) }],
        historyIndex: 0,
      });
    } else {
      set({ project: null, slides: [], history: [], historyIndex: -1 });
    }
  },

  setSlides: (slides) => {
    set({ slides });
    get().pushHistory();
  },

  setTheme: (theme) => set({ theme }),
  setActiveSlide: (i) => set({ activeSlideIndex: i, selectedElementId: null }),
  setZoom: (zoom) => set({ zoom: Math.max(20, Math.min(200, zoom)) }),

  addSlide: (slide) => {
    const newSlide: Slide = {
      id: uid(),
      title: slide?.title ?? 'New slide',
      layout: slide?.layout ?? 'content',
      background: slide?.background ?? get().theme.background,
      elements: slide?.elements ?? [],
      notes: slide?.notes,
    };
    set((s) => ({
      slides: [...s.slides, newSlide],
      activeSlideIndex: s.slides.length,
    }));
    get().pushHistory();
  },

  duplicateSlide: (i) => {
    const original = get().slides[i];
    if (!original) return;
    const copy: Slide = {
      ...JSON.parse(JSON.stringify(original)),
      id: uid(),
      elements: original.elements.map((e) => ({ ...e, id: uid() })),
    };
    set((s) => ({
      slides: [...s.slides.slice(0, i + 1), copy, ...s.slides.slice(i + 1)],
      activeSlideIndex: i + 1,
    }));
    get().pushHistory();
  },

  deleteSlide: (i) => {
    set((s) => {
      const slides = s.slides.filter((_, idx) => idx !== i);
      return {
        slides,
        activeSlideIndex: Math.max(0, Math.min(s.activeSlideIndex, slides.length - 1)),
      };
    });
    get().pushHistory();
  },

  reorderSlides: (ids) => {
    set((s) => ({
      slides: ids
        .map((id) => s.slides.find((sl) => sl.id === id))
        .filter(Boolean) as Slide[],
    }));
    get().pushHistory();
  },

  updateSlide: (i, updates) => {
    set((s) => ({
      slides: s.slides.map((sl, idx) => (idx === i ? { ...sl, ...updates } : sl)),
    }));
    get().pushHistory();
  },

  selectElement: (id) => set({ selectedElementId: id }),

  addElement: (element) => {
    set((s) => {
      const slides = [...s.slides];
      const slide = slides[s.activeSlideIndex];
      if (!slide) return s;
      const newElement: SlideElement = {
        ...element,
        id: uid(),
        zIndex: slide.elements.length + 1,
      };
      slides[s.activeSlideIndex] = { ...slide, elements: [...slide.elements, newElement] };
      return { slides, selectedElementId: newElement.id };
    });
    get().pushHistory();
  },

  updateElement: (id, updates) => {
    set((s) => {
      const slides = [...s.slides];
      const slide = slides[s.activeSlideIndex];
      if (!slide) return s;
      slides[s.activeSlideIndex] = {
        ...slide,
        elements: slide.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
      };
      return { slides };
    });
  },

  removeElement: (id) => {
    set((s) => {
      const slides = [...s.slides];
      const slide = slides[s.activeSlideIndex];
      if (!slide) return s;
      slides[s.activeSlideIndex] = {
        ...slide,
        elements: slide.elements.filter((el) => el.id !== id),
      };
      return { slides, selectedElementId: null };
    });
    get().pushHistory();
  },

  pushHistory: () => {
    const { slides, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ slides: cloneSlides(slides) });
    if (newHistory.length > 50) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const prev = history[historyIndex - 1];
    set({ slides: cloneSlides(prev.slides), historyIndex: historyIndex - 1 });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const next = history[historyIndex + 1];
    set({ slides: cloneSlides(next.slides), historyIndex: historyIndex + 1 });
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
}));
