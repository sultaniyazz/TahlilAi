import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Image, ChevronLeft, ChevronRight, Star, Lock } from 'lucide-react';
import { useProjects } from '@/features/projects/useProjects';
import { useAuth } from '@/app/providers/AuthProvider';
import type { LayoutType } from '@/types';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  layout: LayoutType;
  thumbnail: string;
  isPremium: boolean;
}

const templates: Template[] = [
  {
    id: 'marketing-stats',
    name: 'Marketing Stats',
    description: 'Perfect for showcasing campaign performance and KPIs',
    category: 'Business',
    layout: 'stats',
    thumbnail: 'gradient-purple',
    isPremium: false,
  },
  {
    id: 'recipe-guide',
    name: 'Recipe Guide',
    description: 'Beautiful layout for ingredients and instructions',
    category: 'Food',
    layout: 'list',
    thumbnail: 'gradient-orange',
    isPremium: false,
  },
  {
    id: 'company-timeline',
    name: 'Company Timeline',
    description: 'Show your company journey and milestones',
    category: 'Business',
    layout: 'timeline',
    thumbnail: 'gradient-blue',
    isPremium: true,
  },
  {
    id: 'product-comparison',
    name: 'Product Comparison',
    description: 'Compare features side-by-side',
    category: 'Marketing',
    layout: 'comparison',
    thumbnail: 'gradient-pink',
    isPremium: false,
  },
  {
    id: 'process-flow',
    name: 'Process Flow',
    description: 'Visualize workflows and procedures',
    category: 'Business',
    layout: 'process',
    thumbnail: 'gradient-green',
    isPremium: true,
  },
  {
    id: 'org-chart',
    name: 'Org Chart',
    description: 'Display team structure and hierarchy',
    category: 'Business',
    layout: 'hierarchy',
    thumbnail: 'gradient-cyan',
    isPremium: true,
  },
  {
    id: 'social-proof',
    name: 'Social Proof',
    description: 'Showcase testimonials and reviews',
    category: 'Marketing',
    layout: 'list',
    thumbnail: 'gradient-amber',
    isPremium: false,
  },
  {
    id: 'annual-report',
    name: 'Annual Report',
    description: 'Comprehensive yearly performance summary',
    category: 'Business',
    layout: 'stats',
    thumbnail: 'gradient-indigo',
    isPremium: true,
  },
];

const gradientMap: Record<string, string> = {
  'gradient-purple': 'from-violet-500 to-purple-600',
  'gradient-orange': 'from-orange-500 to-amber-600',
  'gradient-blue': 'from-blue-500 to-cyan-600',
  'gradient-pink': 'from-pink-500 to-rose-600',
  'gradient-green': 'from-emerald-500 to-teal-600',
  'gradient-cyan': 'from-cyan-500 to-blue-600',
  'gradient-amber': 'from-amber-500 to-yellow-600',
  'gradient-indigo': 'from-indigo-500 to-violet-600',
};

function TemplateCard({ template, index }: { template: Template; index: number }) {
  const { createProject } = useProjects();
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  
  const canUse = !template.isPremium || user?.plan === 'pro' || user?.plan === 'team';
  
  const handleClick = () => {
    if (!canUse) return;
    createProject();
    window.location.href = '/editor';
  };
  
  return (
    <motion.div
      className="relative flex-shrink-0 w-64 lg:w-80 cursor-pointer group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
      style={{ skewX: isHovered ? 0 : -2 }}
    >
      {/* Card */}
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden glass-card">
        {/* Thumbnail */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientMap[template.thumbnail]} opacity-80`}>
          {/* Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
          
          {/* Layout Preview */}
          <div className="absolute inset-4 flex flex-col gap-2">
            <div className="h-8 bg-white/20 rounded-lg" />
            <div className="flex-1 flex gap-2">
              <div className="flex-1 bg-white/10 rounded-lg" />
              <div className="flex-1 bg-white/10 rounded-lg" />
            </div>
            <div className="h-16 bg-white/15 rounded-lg" />
          </div>
        </div>
        
        {/* Premium Badge */}
        {template.isPremium && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-amber-500/90 rounded-lg flex items-center gap-1">
            <Star className="w-3 h-3 text-white" />
            <span className="text-xs font-medium text-white">PRO</span>
          </div>
        )}
        
        {/* Hover Overlay */}
        <motion.div
          className="absolute inset-0 bg-black/60 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {canUse ? (
            <motion.button
              className="px-6 py-3 bg-white text-black font-medium rounded-xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: isHovered ? 1 : 0.8, opacity: isHovered ? 1 : 0 }}
              transition={{ delay: 0.1 }}
            >
              Use Template
            </motion.button>
          ) : (
            <motion.div
              className="flex flex-col items-center gap-2"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: isHovered ? 1 : 0.8, opacity: isHovered ? 1 : 0 }}
            >
              <Lock className="w-8 h-8 text-white/60" />
              <span className="text-sm text-white/60">Upgrade to Pro</span>
            </motion.div>
          )}
        </motion.div>
      </div>
      
      {/* Info */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-white/40 uppercase tracking-wider">{template.category}</span>
          {template.isPremium && <Star className="w-3 h-3 text-amber-400" />}
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">{template.name}</h3>
        <p className="text-sm text-white/50">{template.description}</p>
      </div>
    </motion.div>
  );
}

export function Templates() {
  const sectionRef = useRef(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  return (
    <section id="templates" className="relative py-20 lg:py-32 overflow-hidden" ref={sectionRef}>
      {/* Background */}
      <div className="absolute inset-0 bg-[#0F0F11]" />
      
      <div className="relative z-10">
        {/* Section Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6"
          >
            <div>
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <Image className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-white/70">Template Gallery</span>
              </motion.div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Start with a{' '}
                <span className="gradient-text-full">Proven Design</span>
              </h2>
              
              <p className="text-lg text-white/60 max-w-xl">
                Choose from professionally designed templates optimized for different content types.
              </p>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <motion.button
                onClick={() => scroll('left')}
                className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </motion.button>
              <motion.button
                onClick={() => scroll('right')}
                className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </motion.div>
        </div>
        
        {/* Horizontal Scroll */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-8 px-4 sm:px-6 lg:px-8 scrollbar-hide"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {/* Left Fade */}
          <div className="absolute left-0 top-0 bottom-8 w-20 bg-gradient-to-r from-[#0F0F11] to-transparent pointer-events-none z-10" />
          
          {templates.map((template, index) => (
            <div key={template.id} style={{ scrollSnapAlign: 'start' }}>
              <TemplateCard template={template} index={index} />
            </div>
          ))}
          
          {/* Right Fade */}
          <div className="absolute right-0 top-0 bottom-8 w-20 bg-gradient-to-l from-[#0F0F11] to-transparent pointer-events-none z-10" />
        </div>
      </div>
    </section>
  );
}

