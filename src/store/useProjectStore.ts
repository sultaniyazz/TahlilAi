import { create } from 'zustand';
import type { Project, CanvasSettings } from '@/types';
import { projectService } from '@/features/projects/projectsService';

const defaultCanvasSettings: CanvasSettings = {
  width: 1080,
  height: 1080,
  backgroundColor: '#ffffff',
  aspectRatio: '16:9',
};

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  fetchProjects: (userId: string) => Promise<void>;
  createProject: (content?: string, userId?: string) => Promise<Project | null>;
  loadProject: (projectId: string) => Promise<Project | null>;
  saveProject: (updates?: Partial<Project>) => Promise<boolean>;
  updateProjectTitle: (title: string, subtitle?: string) => Promise<boolean>;
  deleteProject: (projectId: string) => Promise<boolean>;
  duplicateProject: (projectId: string) => Promise<Project | null>;
  setProjectPublic: (projectId: string, isPublic: boolean) => Promise<boolean>;
  getPublicProject: (slug: string) => Promise<Project | null>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  fetchProjects: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const projects = projectService
        .getStoredProjects()
        .filter((project) => project.userId === userId)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      set({ projects, isLoading: false });
    } catch (err) {
      set({ error: 'Failed to fetch projects', isLoading: false });
    }
  },

  createProject: async (content = '', userId = 'anonymous') => {
    const existingProjects = projectService.getStoredProjects();
    const newProject: Project = {
      id: projectService.generateId(),
      userId,
      title: 'Untitled Presentation',
      subtitle: undefined,
      pages: content ? [{
        id: projectService.generateId(),
        heading: 'Slide 1',
        content: content,
        elements: [],
      }] : [{
        id: projectService.generateId(),
        heading: 'Untitled Slide',
        content: '',
        elements: [],
      }],
      canvasSettings: defaultCanvasSettings,
      createdAt: new Date(),
      updatedAt: new Date(),
      thumbnail: undefined,
      isPublic: false,
      publicSlug: undefined,
      history: [],
    };

    try {
      const projects = [newProject, ...existingProjects];
      projectService.saveStoredProjects(projects);
      set({ projects, currentProject: newProject });
      return newProject;
    } catch {
      set({ error: 'Failed to create project' });
      return null;
    }
  },

  loadProject: async (projectId) => {
    try {
      const project = projectService.findProject(projectId);
      if (!project) {
        set({ error: 'Project not found' });
        return null;
      }
      set({ currentProject: project });
      return project;
    } catch {
      set({ error: 'Failed to load project' });
      return null;
    }
  },

  saveProject: async (updates) => {
    const currentProject = get().currentProject;
    if (!currentProject) return false;

    try {
      const updatedProject = {
        ...currentProject,
        ...updates,
        updatedAt: new Date(),
      };
      const projects = projectService
        .getStoredProjects()
        .map((project) => (project.id === updatedProject.id ? updatedProject : project));
      projectService.saveStoredProjects(projects);
      set({ currentProject: updatedProject, projects: get().projects.map((project) => (project.id === updatedProject.id ? updatedProject : project)) });
      return true;
    } catch {
      set({ error: 'Failed to save project' });
      return false;
    }
  },

  updateProjectTitle: async (title, subtitle) => {
    const currentProject = get().currentProject;
    if (!currentProject) return false;
    return get().saveProject({ title, subtitle });
  },

  deleteProject: async (projectId) => {
    try {
      const projects = projectService.getStoredProjects().filter((project) => project.id !== projectId);
      projectService.saveStoredProjects(projects);
      set({ projects: get().projects.filter((project) => project.id !== projectId) });
      if (get().currentProject?.id === projectId) set({ currentProject: null });
      return true;
    } catch {
      set({ error: 'Failed to delete project' });
      return false;
    }
  },

  duplicateProject: async (projectId) => {
    try {
      const project = get().projects.find((p) => p.id === projectId);
      if (!project) return null;
      const duplicate = {
        ...project,
        id: projectService.generateId(),
        title: `${project.title} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: false,
        publicSlug: undefined,
      };
      const projects = [duplicate, ...projectService.getStoredProjects()];
      projectService.saveStoredProjects(projects);
      set({ projects });
      return duplicate;
    } catch {
      set({ error: 'Failed to duplicate project' });
      return null;
    }
  },

  setProjectPublic: async (projectId, isPublic) => {
    try {
      const projects = projectService.getStoredProjects().map((project) =>
        project.id === projectId
          ? {
              ...project,
              isPublic,
              publicSlug: isPublic ? projectService.generateId() : undefined,
            }
          : project
      );
      projectService.saveStoredProjects(projects);
      set({ projects: get().projects.map((project) =>
        project.id === projectId ? { ...project, isPublic, publicSlug: isPublic ? projectService.generateId() : undefined } : project
      ) });
      return true;
    } catch {
      set({ error: 'Failed to update project visibility' });
      return false;
    }
  },

  getPublicProject: async (slug) => {
    try {
      const project = projectService.getStoredProjects().find(
        (item) => item.publicSlug === slug && item.isPublic
      );
      return project || null;
    } catch {
      set({ error: 'Failed to fetch public project' });
      return null;
    }
  },
}));
