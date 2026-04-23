import { useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useProjectStore } from '@/store/useProjectStore';

export function useProjects() {
  const { user, isAuthenticated } = useAuth();
  const {
    projects,
    currentProject,
    isLoading,
    error,
    fetchProjects,
    createProject,
    loadProject,
    saveProject,
    updateProjectTitle,
    deleteProject,
    duplicateProject,
    setProjectPublic,
    getPublicProject,
  } = useProjectStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      void fetchProjects(user.id);
    } else {
      useProjectStore.setState({ projects: [], currentProject: null });
    }
  }, [isAuthenticated, user, fetchProjects]);

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
