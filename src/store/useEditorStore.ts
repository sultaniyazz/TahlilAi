import { create } from 'zustand';
import type { InfographicElement, CanvasSettings, Project, Page, EditHistory } from '@/types';

const defaultCanvasSettings: CanvasSettings = {
  width: 1080,
  height: 1080,
  backgroundColor: '#ffffff',
  aspectRatio: '16:9',
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Math.random().toString(36).substring(2, 15)}`;
};

interface EditorState {
  project: Project | null;
  pages: Page[];
  activePageIndex: number;
  selectedElementId: string | null;
  canvasSettings: CanvasSettings;
  history: EditHistory[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
  addPage: (page?: Partial<Page>) => void;
  updatePage: (index: number, updates: Partial<Page>) => void;
  deletePage: (index: number) => void;
  duplicatePage: (index: number) => void;
  reorderPages: (pageIds: string[]) => void;
  setActivePage: (index: number) => void;
  addElement: (element: Omit<InfographicElement, 'id' | 'zIndex'>) => void;
  updateElement: (id: string, updates: Partial<InfographicElement>) => void;
  removeElement: (id: string) => void;
  reorderElements: (elementIds: string[]) => void;
  moveElement: (id: string, x: number, y: number) => void;
  resizeElement: (id: string, width: number, height: number) => void;
  setSelectedElement: (id: string | null) => void;
  updateCanvasSettings: (settings: Partial<CanvasSettings>) => void;
  undo: () => void;
  redo: () => void;
  addToHistory: (action: string) => void;
  clearHistory: () => void;
  setZoom: (zoom: number) => void;
  setProject: (project: Project) => void;
  setPages: (pages: Page[]) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  project: null,
  pages: [],
  activePageIndex: 0,
  selectedElementId: null,
  canvasSettings: defaultCanvasSettings,
  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,
  zoom: 100,

  setProject: (project) => set({ project, pages: project.pages }),

  addPage: (page = {}) => {
    const newPage: Page = {
      id: generateId(),
      heading: page.heading || 'New Slide',
      content: page.content || '',
      elements: page.elements || [],
    };
    set((state) => ({
      pages: [...state.pages, newPage],
      activePageIndex: state.pages.length,
    }));
    get().addToHistory('Add page');
  },

  updatePage: (index, updates) => {
    set((state) => ({
      pages: state.pages.map((page, i) => i === index ? { ...page, ...updates } : page),
    }));
    get().addToHistory('Update page');
  },

  deletePage: (index) => {
    set((state) => {
      const newPages = state.pages.filter((_, i) => i !== index);
      const newIndex = Math.min(state.activePageIndex, newPages.length - 1);
      return {
        pages: newPages,
        activePageIndex: newIndex >= 0 ? newIndex : 0,
      };
    });
    get().addToHistory('Delete page');
  },

  duplicatePage: (index) => {
    const page = get().pages[index];
    if (page) {
      const newPage: Page = {
        ...page,
        id: generateId(),
        heading: `${page.heading} (Copy)`,
      };
      set((state) => ({
        pages: [...state.pages.slice(0, index + 1), newPage, ...state.pages.slice(index + 1)],
        activePageIndex: index + 1,
      }));
      get().addToHistory('Duplicate page');
    }
  },

  reorderPages: (pageIds) => {
    set((state) => ({
      pages: pageIds
        .map((id) => state.pages.find((page) => page.id === id))
        .filter(Boolean) as Page[],
    }));
    get().addToHistory('Reorder pages');
  },

  setActivePage: (index) => set({ activePageIndex: index }),

  addElement: (element) => {
    set((state) => {
      const currentPage = state.pages[state.activePageIndex];
      if (!currentPage) return state;
      const newElement = { ...element, id: generateId(), zIndex: currentPage.elements.length + 1 };
      const updatedPages = state.pages.map((page, i) =>
        i === state.activePageIndex
          ? { ...page, elements: [...page.elements, newElement] }
          : page
      );
      return { pages: updatedPages };
    });
    get().addToHistory('Add element');
  },

  updateElement: (id, updates) => {
    set((state) => ({
      pages: state.pages.map((page, i) =>
        i === state.activePageIndex
          ? { ...page, elements: page.elements.map((el) => el.id === id ? { ...el, ...updates } : el) }
          : page
      ),
    }));
    get().addToHistory('Update element');
  },

  removeElement: (id) => {
    set((state) => ({
      pages: state.pages.map((page, i) =>
        i === state.activePageIndex
          ? { ...page, elements: page.elements.filter((el) => el.id !== id) }
          : page
      ),
    }));
    get().addToHistory('Remove element');
  },

  reorderElements: (elementIds) => {
    set((state) => ({
      pages: state.pages.map((page, i) =>
        i === state.activePageIndex
          ? {
              ...page,
              elements: elementIds
                .map((id) => page.elements.find((el) => el.id === id))
                .filter(Boolean) as InfographicElement[],
            }
          : page
      ),
    }));
    get().addToHistory('Reorder elements');
  },

  moveElement: (id, x, y) => {
    set((state) => ({
      pages: state.pages.map((page, i) =>
        i === state.activePageIndex
          ? {
              ...page,
              elements: page.elements.map((el) =>
                el.id === id ? { ...el, x, y } : el
              ),
            }
          : page
      ),
    }));
    get().addToHistory('Move element');
  },

  resizeElement: (id, width, height) => {
    set((state) => ({
      pages: state.pages.map((page, i) =>
        i === state.activePageIndex
          ? {
              ...page,
              elements: page.elements.map((el) =>
                el.id === id ? { ...el, width, height } : el
              ),
            }
          : page
      ),
    }));
    get().addToHistory('Resize element');
  },

  setSelectedElement: (id) => set({ selectedElementId: id }),

  updateCanvasSettings: (settings) => {
    set((state) => ({
      canvasSettings: { ...state.canvasSettings, ...settings },
    }));
    get().addToHistory('Update canvas settings');
  },

  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const prevHistory = state.history[state.historyIndex - 1];
      set({
        pages: prevHistory.pages,
        historyIndex: state.historyIndex - 1,
        canUndo: state.historyIndex - 1 > 0,
        canRedo: true,
      });
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const nextHistory = state.history[state.historyIndex + 1];
      set({
        pages: nextHistory.pages,
        historyIndex: state.historyIndex + 1,
        canUndo: true,
        canRedo: state.historyIndex + 1 < state.history.length - 1,
      });
    }
  },

  addToHistory: (action) => {
    const state = get();
    const newHistory: EditHistory = {
      id: generateId(),
      timestamp: new Date(),
      action,
      pages: JSON.parse(JSON.stringify(state.pages)),
    };
    const newHistoryArray = state.history.slice(0, state.historyIndex + 1);
    newHistoryArray.push(newHistory);
    set({
      history: newHistoryArray,
      historyIndex: newHistoryArray.length - 1,
      canUndo: newHistoryArray.length > 1,
      canRedo: false,
    });
  },

  clearHistory: () => set({ history: [], historyIndex: -1, canUndo: false, canRedo: false }),

  setZoom: (zoom) => set({ zoom }),
  setPages: (pages) => set({ pages }),
}));
