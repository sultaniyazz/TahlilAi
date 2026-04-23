import type { Project, Page, CanvasSettings, EditHistory } from '@/types';

const LOCAL_PROJECTS_KEY = 'local-projects';

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
};

export const projectService = {
  generateId,
  getStoredProjects(): Project[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(LOCAL_PROJECTS_KEY) || '[]';
      const parsed = JSON.parse(raw) as Array<{
        id: string;
        userId?: string;
        title?: string;
        name?: string;
        description?: string;
        subtitle?: string;
        thumbnailUrl?: string;
        thumbnail?: string;
        pages?: Page[];
        canvasSettings?: CanvasSettings;
        createdAt: string;
        updatedAt: string;
        isPublic?: boolean;
        publicSlug?: string;
        history?: EditHistory[];
      }>;
      return parsed.map((project) => ({
        id: project.id,
        userId: project.userId || 'anonymous',
        title: project.title || project.name || 'Untitled',
        subtitle: project.subtitle,
        pages: project.pages || [],
        canvasSettings: project.canvasSettings || { width: 1080, height: 1080, backgroundColor: '#ffffff', aspectRatio: '16:9' },
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt),
        thumbnail: project.thumbnail || project.thumbnailUrl,
        isPublic: project.isPublic ?? false,
        publicSlug: project.publicSlug,
        history: project.history || [],
      }));
    } catch {
      return [];
    }
  },

  saveStoredProjects(projects: Project[]) {
    if (typeof window === 'undefined') return;
    const serializable = projects.map((project) => ({
      ...project,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    }));
    localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(serializable));
  },

  findProject(projectId: string) {
    return this.getStoredProjects().find((project) => project.id === projectId) || null;
  },

  createProject(project: Project) {
    const projects = this.getStoredProjects();
    this.saveStoredProjects([project, ...projects]);
  },
};
