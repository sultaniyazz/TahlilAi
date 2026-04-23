import { motion } from 'framer-motion';
import { Sparkles, User } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useProjects } from '@/features/projects/useProjects';
import { Navigation } from '@/shared/ui/sections/Navigation';
import { Hero } from '@/shared/ui/sections/Hero';
import { Features } from '@/shared/ui/sections/Features';
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <StatCard icon={Sparkles} color="violet" value={String(projects.length)} label="Loyihalar" />
            <StatCard icon={Sparkles} color="emerald" value={String(projects.filter((p) => p.isPublic).length)} label="Ulashilgan" />
            <StatCard icon={User} color="blue" value={user?.plan === 'free' ? 'Free' : 'Pro'} label="Tarif" />
          </div>
          <ProjectDashboard />
        </motion.div>
      )}

      {!isAuthenticated && <Features />}
      {!isAuthenticated && <Pricing />}

      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text-full">SlideForge AI</span>
          </div>
          <p className="text-sm text-white/30">© 2026 SlideForge AI</p>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ icon: Icon, color, value, label }: { icon: React.ElementType; color: string; value: string; label: string }) {
  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-${color}-500/20 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-sm text-white/50">{label}</p>
        </div>
      </div>
    </div>
  );
}
