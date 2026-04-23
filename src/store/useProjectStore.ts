import { create } from 'zustand';
import type { Project } from '@/types';
import { projectService } from '@/features/projects/projectsService';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  fetchProjects: (userId: string) => Promise<void>;
  createProject: (userId: string, init?: Partial<Project>) => Promise<Project | null>;
  loadProject: (id: string) => Promise<Project | null>;
  saveProject: (updates?: Partial<Project>) => Promise<boolean>;
  updateProjectTitle: (title: string, subtitle?: string) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  duplicateProject: (id: string, userId: string) => Promise<Project | null>;
  setProjectPublic: (id: string, isPublic: boolean) => Promise<string | null>;
  getPublicProject: (slug: string) => Promise<Project | null>;
  setCurrentProject: (project: Project | null) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  fetchProjects: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const projects = await projectService.list(userId);
      set({ projects, isLoading: false });
    } catch (e) {
      console.error(e);
      set({ error: 'Failed to fetch projects', isLoading: false });
    }
  },

  createProject: async (userId, init) => {
    const project = await projectService.create(userId, init);
    if (project) {
      set({
        projects: [project, ...get().projects],
        currentProject: project,
      });
    }
    return project;
  },

  loadProject: async (id) => {
    const project = await projectService.get(id);
    if (project) set({ currentProject: project });
    return project;
  },

  saveProject: async (updates) => {
    const current = get().currentProject;
    if (!current) return false;
    const merged = { ...current, ...updates, updatedAt: new Date() };
    const ok = await projectService.save(current.id, updates ?? {});
    if (ok) {
      set({
        currentProject: merged,
        projects: get().projects.map((p) => (p.id === merged.id ? merged : p)),
      });
    }
    return ok;
  },

  updateProjectTitle: async (title, subtitle) => {
    return get().saveProject({ title, subtitle });
  },

  deleteProject: async (id) => {
    const ok = await projectService.remove(id);
    if (ok) {
      set({
        projects: get().projects.filter((p) => p.id !== id),
        currentProject: get().currentProject?.id === id ? null : get().currentProject,
      });
    }
    return ok;
  },

  duplicateProject: async (id, userId) => {
    const project = await projectService.duplicate(id, userId);
    if (project) set({ projects: [project, ...get().projects] });
    return project;
  },

  setProjectPublic: async (id, isPublic) => {
    const slug = await projectService.setPublic(id, isPublic);
    set({
      projects: get().projects.map((p) =>
        p.id === id ? { ...p, isPublic, publicSlug: slug ?? undefined } : p
      ),
      currentProject:
        get().currentProject?.id === id
          ? { ...get().currentProject!, isPublic, publicSlug: slug ?? undefined }
          : get().currentProject,
    });
    return slug;
  },

  getPublicProject: async (slug) => {
    return projectService.getBySlug(slug);
  },

  setCurrentProject: (project) => set({ currentProject: project }),
}));
