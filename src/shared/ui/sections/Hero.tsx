import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Zap, 
  BarChart3, 
  Clock, 
  Palette,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import type { LayoutType } from '@/types';
import { useAuth } from '@/app/providers/AuthProvider';
import { useProjects } from '@/features/projects/useProjects';
import { useEditorStore } from '@/store';
import { useAI } from '@/features/ai/useAI';
import { generateLayout } from '@/lib/layout-generators';

const floatingShapes = [
  { icon: Zap, color: 'from-violet-500 to-purple-600', delay: 0, x: '10%', y: '20%' },
  { icon: BarChart3, color: 'from-pink-500 to-rose-600', delay: 0.5, x: '85%', y: '30%' },
  { icon: Clock, color: 'from-cyan-500 to-blue-600', delay: 1, x: '75%', y: '70%' },
  { icon: Palette, color: 'from-emerald-500 to-teal-600', delay: 1.5, x: '15%', y: '75%' },
];

const features = [
  { icon: Zap, text: 'AI-Powered Layout' },
  { icon: BarChart3, text: 'Auto Charts' },
  { icon: Clock, text: 'Instant Export' },
  { icon: Palette, text: 'Brand Kit' },
];

export function Hero() {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { 
    analyzeContent, 
    isAnalyzing, 
    aiAnalysis, 
  } = useAI();
  const { createProject, saveProject } = useProjects();
  const { addElement } = useEditorStore();
  const { user } = useAuth();

  const brandColors = [
    user?.brandKit?.primaryColor || '#6B46C1',
    user?.brandKit?.secondaryColor || '#EC4899',
    user?.brandKit?.accentColor || '#06B6D4',
    '#10B981',
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsTyping(false), 500);
    return () => clearTimeout(timer);
  }, [inputText]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    setIsTyping(true);
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    
    // Create new project with initial slide containing the input as content
    const project = await createProject({
      title: inputText.slice(0, 80) || 'Untitled presentation',
      pages: [
        {
          id: crypto.randomUUID(),
          heading: 'Slide 1',
          content: inputText,
          elements: [],
        },
      ],
    });

    if (!project) {
      console.error('Failed to create project');
      return;
    }

    // Analyze content
    const analysis = await analyzeContent(inputText);

    // Generate layout elements
    const elements = generateLayout(
      (analysis.detectedLayout as LayoutType) || 'list',
      analysis,
      project.canvasSettings,
      brandColors
    );

    // Add elements to project
    elements.forEach((element) => {
      addElement(element);
    });

    // Save project
    saveProject();

    // Navigate to editor
    window.location.href = `/editor/${project.id}`;
  };

  const exampleTexts = [
    "The benefits of remote work: 1. Flexibility - 73% of workers report higher satisfaction. 2. Productivity increased by 20%. 3. Better work-life balance saves 2 hours daily commute.",
    "Coffee history timeline: 850 AD - Discovered in Ethiopia. 1475 - First coffee house in Constantinople. 1600s - Reaches Europe. 1773 - Boston Tea Party makes coffee popular in America.",
    "iPhone vs Android: iPhone offers seamless ecosystem and privacy. Android provides customization and variety. iPhone has 28% market share vs Android's 71%.",
  ];

  const loadExample = (index: number) => {
    setInputText(exampleTexts[index]);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[#0F0F11]">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        
        {/* Floating Shapes */}
        {floatingShapes.map((shape, index) => (
          <motion.div
            key={index}
            className={`absolute hidden lg:flex w-16 h-16 rounded-2xl bg-gradient-to-br ${shape.color} items-center justify-center opacity-30`}
            style={{ left: shape.x, top: shape.y }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 6,
              delay: shape.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <shape.icon className="w-8 h-8 text-white" />
          </motion.div>
        ))}
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
          >
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-white/70">AI-Powered Design Assistant</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            From <span className="gradient-text-full">Text</span> to{' '}
            <span className="gradient-text-full">Visual Masterpiece</span>
            <br />
            in Seconds
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl text-white/60 mb-12 max-w-2xl mx-auto"
          >
            AI understands your content and designs the perfect infographic layout automatically. 
            No design skills needed.
          </motion.p>

          {/* Input Area */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-3xl mx-auto mb-8"
          >
            <div 
              id="hero-input"
              className={`relative glass-card p-1 transition-all duration-300 ${
                isTyping ? 'ring-2 ring-violet-500/50 shadow-lg shadow-violet-500/20' : ''
              }`}
            >
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={handleInputChange}
                placeholder="Paste your article, data, or idea here..."
                className="w-full h-40 lg:h-48 bg-transparent text-white placeholder:text-white/30 p-4 lg:p-6 resize-none outline-none text-base lg:text-lg leading-relaxed"
              />
              
              {/* Character Count */}
              <div className="absolute bottom-4 right-4 text-xs text-white/40">
                {inputText.length} characters
              </div>
            </div>
          </motion.div>

          {/* Generate Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <motion.button
              onClick={handleGenerate}
              disabled={!inputText.trim() || isAnalyzing}
              className="btn-primary text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={inputText.trim() && !isAnalyzing ? { scale: 1.05 } : {}}
              whileTap={inputText.trim() && !isAnalyzing ? { scale: 0.95 } : {}}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 inline animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2 inline" />
                  Generate Infographic
                </>
              )}
            </motion.button>
            
            <motion.a
              href="#templates"
              className="btn-secondary text-lg px-8 py-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Templates
              <ArrowRight className="w-5 h-5 ml-2 inline" />
            </motion.a>
          </motion.div>

          {/* Example Prompts */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-16"
          >
            <p className="text-sm text-white/40 mb-4">Try an example:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Remote Work Stats', 'Coffee History', 'iPhone vs Android'].map((example, index) => (
                <button
                  key={example}
                  onClick={() => loadExample(index)}
                  className="px-4 py-2 text-sm text-white/60 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full transition-all"
                >
                  {example}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4 lg:gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.text}
                className="flex items-center gap-2 text-white/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <feature.icon className="w-4 h-4" />
                <span className="text-sm">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* AI Analysis Preview */}
      <AnimatePresence>
        {aiAnalysis && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-8 right-8 glass-card p-4 max-w-xs hidden lg:block"
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium text-white">AI Analysis Complete</span>
            </div>
            <div className="space-y-2 text-sm text-white/60">
              <p>Layout: <span className="text-white">{aiAnalysis.detectedLayout}</span></p>
              <p>Stats found: <span className="text-white">{aiAnalysis.statistics.length}</span></p>
              <p>Dates found: <span className="text-white">{aiAnalysis.dates.length}</span></p>
              <p>Confidence: <span className="text-white">{Math.round(aiAnalysis.confidence * 100)}%</span></p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

