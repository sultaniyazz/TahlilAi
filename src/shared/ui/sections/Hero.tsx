import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Loader2, Wand2 } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useProjects } from '@/features/projects/useProjects';
import { useAI } from '@/features/ai/useAI';
import { buildSlideFromAI } from '@/lib/slide-layouts';
import { DEFAULT_THEME } from '@/types';
import { toast } from 'sonner';

const examples = [
  'Sun’iy intellektning ta’limga ta’siri',
  'Bizning kompaniya 2026 strategiyasi',
  'Sog‘lom turmush tarzining 5 qoidasi',
];

export function Hero() {
  const [prompt, setPrompt] = useState('');
  const [slideCount, setSlideCount] = useState(8);
  const { isGenerating, generatePresentation } = useAI();
  const { createProject } = useProjects();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const result = await generatePresentation(prompt, { slideCount });
      const theme = { ...DEFAULT_THEME, ...result.theme };
      const slides = result.slides.map((s) => buildSlideFromAI(s, theme));
      const project = await createProject({
        title: result.title,
        subtitle: result.subtitle,
        slides,
        theme,
      });
      if (project) {
        toast.success('Tayyor! Editorga o‘tilmoqda...');
        navigate(`/editor/${project.id}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xato yuz berdi');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-[#0F0F11]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-white/70">AI bilan ishlaydigan taqdimot dizayneri</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Bir gapdan{' '}
            <span className="gradient-text-full">to‘liq taqdimot</span>
            <br />
            bir necha soniyada
          </h1>

          <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
            Mavzuni yozing — AI sizga professional slaydlar, dizayn va tarkibni avtomatik tayyorlaydi.
            PPTX, PDF yoki PNG sifatida yuklab oling.
          </p>

          <div className="max-w-2xl mx-auto mb-6">
            <div className="glass-card p-2">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Masalan: Sun’iy intellektning ta’limga ta’siri haqida 10 ta slayd"
                rows={3}
                className="w-full bg-transparent text-white placeholder:text-white/30 p-4 resize-none outline-none text-base"
              />
              <div className="flex items-center justify-between p-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-white/50">Slaydlar:</label>
                  <input
                    type="number" min={3} max={20} value={slideCount}
                    onChange={(e) => setSlideCount(Number(e.target.value))}
                    className="w-16 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-sm"
                  />
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 text-white font-medium hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isGenerating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Yaratilmoqda...</>
                  ) : (
                    <><Wand2 className="w-4 h-4" /> Yaratish <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-xs text-white/40 self-center">Misollar:</span>
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => setPrompt(ex)}
                className="px-3 py-1.5 text-xs text-white/60 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full transition-all"
              >
                {ex}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
