import { motion } from 'framer-motion';
import { Sparkles, User } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useProjects } from '@/features/projects/useProjects';
import { Navigation } from '@/shared/ui/sections/Navigation';
import { Hero } from '@/shared/ui/sections/Hero';
import { Features } from '@/shared/ui/sections/Features';
import { Templates } from '@/shared/ui/sections/Templates';
import { Pricing } from '@/shared/ui/sections/Pricing';
import { ProjectDashboard } from '@/shared/ui/dashboard/ProjectDashboard';

export default function Homepage() {
  const { user, isAuthenticated } = useAuth();
  const { projects } = useProjects();

  return (
    <div className="min-h-screen bg-[#0F0F11]">
      <Navigation />
      <Hero />

      {isAuthenticated && (
        <motion.div
          id="projects"
          key="dashboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{projects.length}</p>
                  <p className="text-sm text-white/50">Projects</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{projects.filter((p) => p.isPublic).length}</p>
                  <p className="text-sm text-white/50">Published</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{user?.plan === 'free' ? 'Free' : 'Pro'}</p>
                  <p className="text-sm text-white/50">Plan</p>
                </div>
              </div>
            </div>
          </div>

          <ProjectDashboard />
        </motion.div>
      )}

      {!isAuthenticated && <Features />}
      <Templates />
      <Pricing />

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text-full">
                InfoGraphic AI
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-white/50">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>

            <p className="text-sm text-white/30">
              В© 2026 InfoGraphic AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

