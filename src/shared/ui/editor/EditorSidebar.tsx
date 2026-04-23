import { useState } from 'react';
import {
  Plus, Type, Square, Circle as CircleIcon, Image as ImageIcon,
  BarChart3, Trash2, Copy, Download, Sparkles, Undo2, Redo2,
  ZoomIn, ZoomOut, Save, Share2, Loader2, FileText, Presentation,
} from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useAI } from '@/features/ai/useAI';
import { buildSlideFromAI } from '@/lib/slide-layouts';
import { exportSlidesAsPDF, exportSlidesAsPPTX, exportSlideAsPNG } from '@/lib/export-service';
import { ScaledSlide } from './ScaledSlide';
import { toast } from 'sonner';
import { createRoot } from 'react-dom/client';

const SLIDE_W = 1920;
const SLIDE_H = 1080;

type Tab = 'slides' | 'add' | 'ai' | 'theme' | 'export';

export function EditorSidebar() {
  const [tab, setTab] = useState<Tab>('slides');
  const [aiPrompt, setAiPrompt] = useState('');
  const [slideCount, setSlideCount] = useState(8);
  const [tone, setTone] = useState('professional');
  const [isExporting, setIsExporting] = useState(false);

  const {
    slides, activeSlideIndex, theme, zoom, setZoom, setActiveSlide,
    addSlide, deleteSlide, duplicateSlide, addElement, removeElement,
    selectedElementId, undo, redo, canUndo, canRedo, setSlides, setTheme,
  } = useEditorStore();

  const { saveProject, currentProject, setProjectPublic } = useProjectStore();
  const { isGenerating, generatePresentation } = useAI();

  const handleSave = async () => {
    const ok = await saveProject({ slides, theme });
    toast[ok ? 'success' : 'error'](ok ? 'Saqlandi' : 'Saqlashda xato');
  };

  const handleAI = async () => {
    if (!aiPrompt.trim()) return;
    try {
      const result = await generatePresentation(aiPrompt, { slideCount, tone });
      const newTheme = {
        ...theme,
        primary: result.theme.primary,
        secondary: result.theme.secondary,
        accent: result.theme.accent,
        background: result.theme.background,
      };
      setTheme(newTheme);
      const newSlides = result.slides.map((s) => buildSlideFromAI(s, newTheme));
      setSlides(newSlides);
      await saveProject({
        title: result.title,
        subtitle: result.subtitle,
        slides: newSlides,
        theme: newTheme,
      });
      toast.success(`${newSlides.length} ta slayd yaratildi`);
      setTab('slides');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'AI xato');
    }
  };

  const handleAddElement = (type: 'heading' | 'text' | 'shape' | 'circle') => {
    if (type === 'heading') {
      addElement({
        type: 'heading', x: 200, y: 200, width: 1200, height: 160,
        content: 'New heading',
        style: { fontSize: 72, fontFamily: theme.fontHeading, fontWeight: 700, color: '#FFFFFF', textAlign: 'left' },
      });
    } else if (type === 'text') {
      addElement({
        type: 'text', x: 200, y: 400, width: 1200, height: 100,
        content: 'New text',
        style: { fontSize: 28, fontFamily: theme.fontBody, color: '#E5E7EB', textAlign: 'left' },
      });
    } else if (type === 'shape') {
      addElement({
        type: 'shape', shapeType: 'rectangle', x: 600, y: 400, width: 400, height: 200,
        content: '', style: { backgroundColor: theme.primary, borderRadius: 16 },
      });
    } else {
      addElement({
        type: 'shape', shapeType: 'circle', x: 700, y: 400, width: 200, height: 200,
        content: '', style: { backgroundColor: theme.accent },
      });
    }
  };

  // Render every slide to a hidden 1920x1080 DOM node, then export
  const withRenderedSlides = async (
    fn: (els: HTMLElement[]) => Promise<void>,
  ) => {
    const host = document.createElement('div');
    host.style.position = 'fixed';
    host.style.left = '-99999px';
    host.style.top = '0';
    host.style.width = `${SLIDE_W}px`;
    host.style.height = `${SLIDE_H * slides.length}px`;
    document.body.appendChild(host);
    const nodes: HTMLDivElement[] = [];
    for (let i = 0; i < slides.length; i++) {
      const wrap = document.createElement('div');
      wrap.style.width = `${SLIDE_W}px`;
      wrap.style.height = `${SLIDE_H}px`;
      host.appendChild(wrap);
      const root = createRoot(wrap);
      root.render(<ScaledSlide slide={slides[i]} theme={theme} scale={1} />);
      nodes.push(wrap);
    }
    // Wait for paint
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await new Promise((r) => setTimeout(r, 200));
    try {
      await fn(nodes);
    } finally {
      document.body.removeChild(host);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await withRenderedSlides(async (els) => {
        await exportSlidesAsPDF(els, `${currentProject?.title || 'presentation'}.pdf`);
      });
      toast.success('PDF tayyor');
    } catch (e) {
      toast.error('Eksport xato');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPNG = async () => {
    setIsExporting(true);
    try {
      await withRenderedSlides(async (els) => {
        await exportSlideAsPNG(els[activeSlideIndex], `slide-${activeSlideIndex + 1}.png`);
      });
      toast.success('PNG tayyor');
    } catch {
      toast.error('Eksport xato');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPPTX = async () => {
    setIsExporting(true);
    try {
      await exportSlidesAsPPTX(slides, theme, `${currentProject?.title || 'presentation'}.pptx`);
      toast.success('PPTX tayyor');
    } catch {
      toast.error('PPTX eksport xato');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!currentProject) return;
    const slug = await setProjectPublic(currentProject.id, true);
    if (slug) {
      const url = `${window.location.origin}/share/${slug}`;
      await navigator.clipboard.writeText(url);
      toast.success('Havola nusxalandi');
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'slides', label: 'Slaydlar', icon: FileText },
    { id: 'add', label: 'Qo‘shish', icon: Plus },
    { id: 'ai', label: 'AI', icon: Sparkles },
    { id: 'theme', label: 'Tema', icon: Square },
    { id: 'export', label: 'Eksport', icon: Download },
  ];

  return (
    <div className="w-80 bg-[#0F0F11] border-r border-white/10 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-white/10">
        <button onClick={undo} disabled={!canUndo()} className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30" title="Undo">
          <Undo2 className="w-4 h-4 text-white/70" />
        </button>
        <button onClick={redo} disabled={!canRedo()} className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30" title="Redo">
          <Redo2 className="w-4 h-4 text-white/70" />
        </button>
        <div className="w-px h-4 bg-white/10 mx-1" />
        <button onClick={() => setZoom(zoom - 10)} className="p-2 rounded-lg hover:bg-white/10">
          <ZoomOut className="w-4 h-4 text-white/70" />
        </button>
        <span className="text-xs text-white/50 w-12 text-center">{zoom}%</span>
        <button onClick={() => setZoom(zoom + 10)} className="p-2 rounded-lg hover:bg-white/10">
          <ZoomIn className="w-4 h-4 text-white/70" />
        </button>
        <div className="flex-1" />
        <button onClick={handleSave} className="p-2 rounded-lg hover:bg-white/10" title="Saqlash">
          <Save className="w-4 h-4 text-white/70" />
        </button>
        <button onClick={handleShare} className="p-2 rounded-lg hover:bg-white/10" title="Ulashish">
          <Share2 className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2 text-[10px] transition-colors ${
              tab === t.id ? 'text-violet-400 border-b-2 border-violet-400' : 'text-white/50 hover:text-white/70'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto p-3 custom-scrollbar">
        {tab === 'slides' && (
          <div className="space-y-2">
            {slides.map((s, i) => (
              <div
                key={s.id}
                onClick={() => setActiveSlide(i)}
                className={`group relative rounded-lg border cursor-pointer overflow-hidden ${
                  activeSlideIndex === i ? 'border-violet-500' : 'border-white/10 hover:border-white/30'
                }`}
              >
                <div className="aspect-video w-full bg-black/40 overflow-hidden">
                  <div className="origin-top-left" style={{ transform: 'scale(0.14)', width: SLIDE_W, height: SLIDE_H }}>
                    <ScaledSlide slide={s} theme={theme} scale={1} />
                  </div>
                </div>
                <div className="absolute bottom-1 left-2 text-[10px] text-white/70 bg-black/50 px-1.5 rounded">
                  {i + 1}. {s.title.slice(0, 24)}
                </div>
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); duplicateSlide(i); }}
                    className="p-1 bg-black/60 rounded hover:bg-white/20"
                  >
                    <Copy className="w-3 h-3 text-white" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSlide(i); }}
                    className="p-1 bg-black/60 rounded hover:bg-red-500/40"
                  >
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => addSlide()}
              className="w-full py-3 rounded-lg border border-dashed border-white/20 text-white/60 hover:bg-white/5 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Slayd qo‘shish
            </button>
          </div>
        )}

        {tab === 'add' && (
          <div className="grid grid-cols-2 gap-2">
            <ToolButton label="Sarlavha" icon={Type} onClick={() => handleAddElement('heading')} />
            <ToolButton label="Matn" icon={Type} onClick={() => handleAddElement('text')} />
            <ToolButton label="To‘rtburchak" icon={Square} onClick={() => handleAddElement('shape')} />
            <ToolButton label="Doira" icon={CircleIcon} onClick={() => handleAddElement('circle')} />
            <ToolButton label="Rasm" icon={ImageIcon} onClick={() => toast('Yaqinda')} />
            <ToolButton label="Diagramma" icon={BarChart3} onClick={() => toast('Yaqinda')} />
            {selectedElementId && (
              <button
                onClick={() => removeElement(selectedElementId)}
                className="col-span-2 mt-2 py-2 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 text-sm flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Tanlangan elementni o‘chirish
              </button>
            )}
          </div>
        )}

        {tab === 'ai' && (
          <div className="space-y-3">
            <label className="block text-xs text-white/60">Mavzu</label>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={5}
              placeholder="Masalan: Sun’iy intellektning ta’limga ta’siri"
              className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm resize-none focus:border-violet-500/50 outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-white/60 mb-1">Slaydlar</label>
                <input
                  type="number" min={3} max={20} value={slideCount}
                  onChange={(e) => setSlideCount(Number(e.target.value))}
                  className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Uslub</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Erkin</option>
                  <option value="academic">Akademik</option>
                  <option value="creative">Ijodiy</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleAI}
              disabled={!aiPrompt.trim() || isGenerating}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isGenerating ? 'Yaratilmoqda...' : 'AI bilan yaratish'}
            </button>
          </div>
        )}

        {tab === 'theme' && (
          <div className="space-y-4">
            {(['primary', 'secondary', 'accent', 'background'] as const).map((key) => (
              <div key={key}>
                <label className="block text-xs text-white/60 mb-1 capitalize">{key}</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={theme[key]}
                    onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    value={theme[key]}
                    onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
                    className="flex-1 p-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs uppercase"
                  />
                </div>
              </div>
            ))}
            <div>
              <label className="block text-xs text-white/60 mb-1">Sarlavha shrift</label>
              <select
                value={theme.fontHeading}
                onChange={(e) => setTheme({ ...theme, fontHeading: e.target.value })}
                className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
              >
                {['Inter', 'Space Grotesk', 'Montserrat', 'Poppins', 'Playfair Display'].map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {tab === 'export' && (
          <div className="space-y-3">
            <button
              onClick={handleExportPPTX}
              disabled={isExporting || slides.length === 0}
              className="w-full py-3 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 font-medium border border-orange-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Presentation className="w-4 h-4" /> PowerPoint (.pptx)
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExporting || slides.length === 0}
              className="w-full py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-medium border border-red-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FileText className="w-4 h-4" /> PDF (.pdf)
            </button>
            <button
              onClick={handleExportPNG}
              disabled={isExporting || slides.length === 0}
              className="w-full py-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-medium border border-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ImageIcon className="w-4 h-4" /> Aktiv slayd PNG
            </button>
            {isExporting && (
              <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Eksport qilinmoqda...
              </div>
            )}
            <div className="text-xs text-white/40 mt-2">
              PPTX — PowerPoint'da to‘liq tahrirlash mumkin. PDF/PNG — yuqori sifat raster.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ToolButton({ label, icon: Icon, onClick }: { label: string; icon: React.ElementType; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-colors"
    >
      <Icon className="w-5 h-5 text-violet-400" />
      <span className="text-xs text-white/80">{label}</span>
    </button>
  );
}
