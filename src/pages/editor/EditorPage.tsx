import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useProjects } from '@/features/projects/useProjects';
import { useEditorStore } from '@/store/useEditorStore';
import { EditorSidebar } from '@/shared/ui/editor/EditorSidebar';
import { InfographicCanvas } from '@/shared/ui/editor/InfographicCanvas';

export default function EditorPage() {
  const { user } = useAuth();
  const { loadProject, saveProject, createProject } = useProjects();
  const { pages, canvasSettings, project } = useEditorStore();
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId?: string }>();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeEditor = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const queryProjectId = urlParams.get('project');
      const projectParam = projectId || queryProjectId;

      if (projectParam) {
        const loaded = await loadProject(projectParam);
        if (loaded) {
          useEditorStore.setState({
            pages: loaded.pages || [],
            canvasSettings: loaded.canvasSettings,
            project: loaded,
          });
        }
      } else if (!project && user) {
        const newProject = await createProject();
        if (newProject) {
          navigate(`/editor/${newProject.id}`, { replace: true });
        }
      }
      setIsInitialized(true);
    };

    initializeEditor();
  }, [user, projectId, loadProject, createProject, project, navigate]);

  useEffect(() => {
    if (!project || !isInitialized) return;

    const saveTimer = setTimeout(() => {
      saveProject({
        pages,
        canvasSettings,
      });
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [pages, canvasSettings, project, isInitialized, saveProject]);

  return (
    <div className="h-screen flex flex-col bg-[#0F0F11]">
      {/* Editor Header */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-[#0F0F11]">
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </a>
          <div className="h-6 w-px bg-white/10" />
          <div>
            <h1 className="text-sm font-medium text-white">
              {project?.title || 'Untitled'}
            </h1>
            <p className="text-xs text-white/40">
              {project?.pages?.length ? `${project.pages.length} slides` : 'Draft'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            Dashboard
          </a>
          <a
            href="/brand"
            className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            Brand Kit
          </a>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden">
        <EditorSidebar />
        <InfographicCanvas />
      </div>
    </div>
  );
}

