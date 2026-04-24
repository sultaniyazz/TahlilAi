import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useProjects } from '@/features/projects/useProjects';
import { useEditorStore } from '@/store/useEditorStore';
import { EditorSidebar } from '@/shared/ui/editor/EditorSidebar';
import { EditorCanvas } from '@/shared/ui/editor/EditorCanvas';

export default function EditorPage() {
  const { user } = useAuth();
  const { loadProject, saveProject, createProject, currentProject } = useProjects();
  const { setProject, slides, theme } = useEditorStore();
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId?: string }>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) return;
    const init = async () => {
      const params = new URLSearchParams(window.location.search);
      const pid = projectId || params.get('project');
      if (pid) {
        const loaded = await loadProject(pid);
        if (loaded) setProject(loaded);
      } else {
        const created = await createProject();
        if (created) {
          setProject(created);
          navigate(`/editor/${created.id}`, { replace: true });
        }
      }
      setReady(true);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, projectId]);

  // Autosave 2s debounce
  useEffect(() => {
    if (!ready || !currentProject) return;
    const t = setTimeout(() => {
      saveProject({ slides, theme });
    }, 2000);
    return () => clearTimeout(t);
  }, [slides, theme, ready, currentProject, saveProject]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0F0F11] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0F0F11]">
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </a>
          <div className="h-6 w-px bg-white/10" />
          <div>
            <h1 className="text-sm font-medium text-white">
              {currentProject?.title || 'Untitled'}
            </h1>
            <p className="text-xs text-white/40">{slides.length} ta slayd</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href="/" className="px-3 py-1.5 text-sm text-white/70 hover:text-white">
            Bosh sahifa
          </a>
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        <EditorSidebar />
        <EditorCanvas />
      </div>
    </div>
  );
}