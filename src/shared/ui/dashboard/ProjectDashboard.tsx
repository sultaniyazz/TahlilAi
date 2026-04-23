import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Clock,
  Share2,
  Trash2,
  Copy,
  Folder,
  Loader2
} from 'lucide-react';
import { useProjects } from '@/features/projects/useProjects';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/shared/ui/input';
import { toast } from 'sonner';

export function ProjectDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const {
    projects,
    isLoading,
    loadProject,
    deleteProject,
    duplicateProject,
    setProjectPublic,
  } = useProjects();

  const filteredProjects = projects
    .filter((p) => {
      if (searchQuery) {
        return p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               p.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const handleOpenProject = async (projectId: string) => {
    await loadProject(projectId);
    navigate(`/editor?project=${projectId}`);
  };

  const handleDuplicate = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    const duplicated = await duplicateProject(projectId);
    if (duplicated) {
      toast.success('Project duplicated');
    } else {
      toast.error('Failed to duplicate project');
    }
  };

  const handleDelete = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      const success = await deleteProject(projectId);
      if (success) {
        toast.success('Project deleted');
      } else {
        toast.error('Failed to delete project');
      }
    }
  };

  const handleShare = async (e: React.MouseEvent, project: typeof projects[0]) => {
    e.stopPropagation();
    const success = await setProjectPublic(project.id, true);
    if (success) {
      const shareUrl = `${window.location.origin}/share/${project.publicSlug || project.id}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard');
    } else {
      toast.error('Failed to share project');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Create New Project */}
      {/* Search */}
      {projects.length > 0 && (
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-white placeholder:text-white/40"
            />
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white/60 mb-2">
            {searchQuery ? 'No projects found' : 'No projects yet'}
          </h3>
          <p className="text-white/40 text-sm">
            {searchQuery ? 'Try a different search term' : 'Create your first project to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => handleOpenProject(project.id)}
                className="group cursor-pointer rounded-xl border border-white/10 bg-white/5 p-4 hover:border-white/20 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-white truncate mb-1">
                      {project.title}
                    </h3>
                    {project.subtitle && (
                      <p className="text-white/60 text-sm line-clamp-2">
                        {project.subtitle}
                      </p>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center ml-2">
                    <Folder className="w-4 h-4 text-violet-400" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-white/50 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                  </span>
                  {project.isPublic && (
                    <span className="flex items-center gap-1 text-violet-300">
                      <Share2 className="w-3 h-3" />
                      Shared
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDuplicate(e as unknown as React.MouseEvent, project.id)}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    Duplicate
                  </button>
                  <button
                    onClick={(e) => handleShare(e as unknown as React.MouseEvent, project)}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Share2 className="w-3 h-3" />
                    Share
                  </button>
                  <button
                    onClick={(e) => handleDelete(e as unknown as React.MouseEvent, project.id)}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

