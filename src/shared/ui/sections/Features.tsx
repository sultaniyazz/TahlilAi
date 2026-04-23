import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Brain, 
  BarChart3, 
  Palette, 
  Download, 
  Share2, 
  Zap,
  Layers
} from 'lucide-react';

const features = [
  {
    id: 'smart-layout',
    title: 'AI Layout Engine',
    description: 'Automatically detects structure in your text and chooses the perfect layout - Timeline, Comparison, Stats, or List.',
    icon: Brain,
    size: 'large',
    gradient: 'from-violet-500/20 to-purple-600/20',
  },
  {
    id: 'auto-viz',
    title: 'Auto-Visualization',
    description: 'Numbers become charts. Concepts become icons. Data tells stories.',
    icon: BarChart3,
    size: 'small',
    gradient: 'from-pink-500/20 to-rose-600/20',
  },
  {
    id: 'brand-kit',
    title: 'Brand Kit Sync',
    description: 'Automatically applies your colors, fonts, and logos to every design.',
    icon: Palette,
    size: 'small',
    gradient: 'from-cyan-500/20 to-blue-600/20',
  },
  {
    id: 'export',
    title: 'High-Res Export',
    description: 'Download in 4K PNG or Print-ready PDF at 300 DPI.',
    icon: Download,
    size: 'small',
    gradient: 'from-emerald-500/20 to-teal-600/20',
  },
  {
    id: 'share',
    title: 'One-Click Share',
    description: 'Generate a live link for social media or embed anywhere.',
    icon: Share2,
    size: 'small',
    gradient: 'from-amber-500/20 to-orange-600/20',
  },
  {
    id: 'speed',
    title: 'Lightning Fast',
    description: 'From text to visual in under 10 seconds. No waiting, no rendering queues.',
    icon: Zap,
    size: 'small',
    gradient: 'from-red-500/20 to-pink-600/20',
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  const isLarge = feature.size === 'large';
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1]
      }}
      className={`group relative glass-card p-6 lg:p-8 overflow-hidden cursor-pointer ${
        isLarge ? 'md:col-span-2 md:row-span-2' : ''
      }`}
      whileHover={{ scale: 1.02, y: -5 }}
    >
      {/* Spotlight Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-radial from-white/5 to-transparent" />
      </div>
      
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <motion.div
          className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 lg:mb-6`}
          whileHover={{ rotate: 5, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <feature.icon className={`w-6 h-6 lg:w-7 lg:h-7 text-white`} />
        </motion.div>
        
        {/* Title */}
        <h3 className={`font-bold text-white mb-2 lg:mb-3 ${isLarge ? 'text-2xl lg:text-3xl' : 'text-lg lg:text-xl'}`}>
          {feature.title}
        </h3>
        
        {/* Description */}
        <p className={`text-white/60 leading-relaxed ${isLarge ? 'text-base lg:text-lg' : 'text-sm'}`}>
          {feature.description}
        </p>
        
        {/* Learn More Link (Large Cards Only) */}
        {isLarge && (
          <motion.div
            className="mt-6 flex items-center gap-2 text-violet-400 text-sm font-medium"
            initial={{ opacity: 0, x: -10 }}
            whileHover={{ x: 5 }}
          >
            <span>Learn more</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.div>
        )}
      </div>
      
      {/* Border Glow on Hover */}
      <div className="absolute inset-0 rounded-2xl border border-white/0 group-hover:border-white/20 transition-colors duration-300" />
    </motion.div>
  );
}

export function Features() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  
  return (
    <section id="features" className="relative py-20 lg:py-32" ref={sectionRef}>
      {/* Background */}
      <div className="absolute inset-0 bg-[#0F0F11]" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 lg:mb-20"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Layers className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-white/70">Powerful Features</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Everything You Need to{' '}
            <span className="gradient-text-full">Create Stunning Visuals</span>
          </h2>
          
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Our AI-powered platform handles the design complexity so you can focus on your message.
          </p>
        </motion.div>
        
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

