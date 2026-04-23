import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles, Folder, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProjects } from '@/features/projects/useProjects';
import { ScaledSlide } from '@/shared/ui/editor/ScaledSlide';
import type { Project } from '@/types';

export default function SharePage() {
  const { slug } = useParams<{ slug: string }>();
  const { getPublicProject } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!slug) { setIsLoading(false); return; }
    getPublicProject(slug).then((p) => {
      setProject(p);
      setIsLoading(false);
    });
  }, [slug, getPublicProject]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F11] flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-violet-400 animate-pulse" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0F0F11] flex items-center justify-center">
        <div className="text-center">
          <Folder className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Taqdimot topilmadi</h1>
          <a href="/" className="text-violet-400 hover:underline">Bosh sahifa</a>
        </div>
      </div>
    );
  }

  const slide = project.slides[activeIdx];

  return (
    <div className="min-h-screen bg-[#0F0F11]">
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text-full">SlideForge AI</span>
          </a>
          <a href="/signup" className="btn-primary text-sm">O‘zingiz yarating</a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
        {project.subtitle && <p className="text-white/60 mb-6">{project.subtitle}</p>}

        {slide && (
          <div className="relative">
            <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
              <div className="origin-top-left" style={{ transform: 'scale(0.5)', width: 1920, height: 1080 }}>
                <ScaledSlide slide={slide} theme={project.theme} scale={1} />
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
                disabled={activeIdx === 0}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <span className="text-white/60 text-sm">
                {activeIdx + 1} / {project.slides.length}
              </span>
              <button
                onClick={() => setActiveIdx(Math.min(project.slides.length - 1, activeIdx + 1))}
                disabled={activeIdx === project.slides.length - 1}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
