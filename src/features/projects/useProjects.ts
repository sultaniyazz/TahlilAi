import { useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useProjectStore } from '@/store/useProjectStore';
import type { Project } from '@/types';

export function useProjects() {
  const { user, isAuthenticated } = useAuth();
  const {
    projects,
    currentProject,
    isLoading,
    error,
    fetchProjects,
    loadProject,
    saveProject,
    updateProjectTitle,
    deleteProject,
    setProjectPublic,
    getPublicProject,
    createProject: createProjectInStore,
    duplicateProject: duplicateProjectInStore,
  } = useProjectStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      void fetchProjects(user.id);
    } else {
      useProjectStore.setState({ projects: [], currentProject: null });
    }
  }, [isAuthenticated, user, fetchProjects]);

  const createProject = async (init?: Partial<Project>) => {
    if (!user) return null;
    return createProjectInStore(user.id, init);
  };

  const duplicateProject = async (id: string) => {
    if (!user) return null;
    return duplicateProjectInStore(id, user.id);
  };

  return {
    projects,
    currentProject,
    isLoading,
    error,
    createProject,
    loadProject,
    saveProject,
    updateProjectTitle,
    deleteProject,
    duplicateProject,
    setProjectPublic,
    getPublicProject,
  };
}
