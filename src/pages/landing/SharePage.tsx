import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles, Folder } from 'lucide-react';
import { useProjects } from '@/features/projects/useProjects';

export default function SharePage() {
  const { slug } = useParams<{ slug: string }>();
  const { getPublicProject } = useProjects();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!slug) {
        setError(true);
        setIsLoading(false);
        return;
      }

      const publicProject = await getPublicProject(slug);
      if (publicProject) {
        setProject(publicProject);
      } else {
        setError(true);
      }
      setIsLoading(false);
    };

    fetchProject();
  }, [slug, getPublicProject]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F11] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="spinner mx-auto" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#0F0F11] flex items-center justify-center">
        <div className="text-center">
          <Folder className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Infographic not found</h1>
          <p className="text-white/50 mb-6">This infographic may have been removed or is no longer public.</p>
          <a href="/" className="btn-primary">
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F11]">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text-full">
                InfoGraphic AI
              </span>
            </a>
            <a href="/signup" className="btn-primary text-sm">
              Create Your Own
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
        {project.subtitle && (
          <p className="text-white/60 mb-8">{project.subtitle}</p>
        )}
        
        {/* Canvas Preview */}
        <div 
          className="relative rounded-2xl overflow-hidden border border-white/10"
          style={{
            backgroundColor: project.canvasSettings?.backgroundColor || '#ffffff',
            aspectRatio: project.canvasSettings?.aspectRatio === '1:1' ? '1/1' : 
                        project.canvasSettings?.aspectRatio === '16:9' ? '16/9' : 
                        project.canvasSettings?.aspectRatio === '9:16' ? '9/16' : '4/5',
          }}
        >
          {project.elements?.map((element: any, index: number) => (
            <div
              key={element.id || index}
              className="absolute"
              style={{
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                ...element.style,
              }}
            >
              {element.type === 'text' || element.type === 'heading' ? (
                <div style={{ 
                  fontSize: element.style?.fontSize,
                  fontWeight: element.style?.fontWeight,
                  color: element.style?.color,
                  textAlign: element.style?.textAlign,
                }}>
                  {element.content}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

