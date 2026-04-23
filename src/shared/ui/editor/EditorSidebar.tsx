import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Type, 
  Square, 
  BarChart3, 
  Sparkles, 
  Layers, 
  Palette, 
  Download,
  Layout,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Share2,
  Save,
  Image as ImageIcon
} from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useAI } from '@/features/ai/useAI';
import { exportAsPNG, exportPagesAsPDF, exportPagesAsPPTX, estimateFileSize } from '@/shared/services/export/exportService';
import { Slider } from '@/shared/ui/slider';
import { Switch } from '@/shared/ui/switch';
import { toast } from 'sonner';

const tabs = [
  { id: 'elements', label: 'Elements', icon: Layout },
  { id: 'layers', label: 'Layers', icon: Layers },
  { id: 'styles', label: 'Styles', icon: Palette },
  { id: 'ai', label: 'AI', icon: Sparkles },
  { id: 'export', label: 'Export', icon: Download },
];

const elementTypes = [
  { type: 'heading', label: 'Heading', icon: Type },
  { type: 'text', label: 'Text', icon: Type },
  { type: 'stat', label: 'Statistic', icon: BarChart3 },
  { type: 'chart', label: 'Chart', icon: BarChart3 },
  { type: 'shape', label: 'Shape', icon: Square },
  { type: 'image', label: 'Image', icon: ImageIcon },
];

export function EditorSidebar() {
  const [activeTab, setActiveTab] = useState('elements');
  const [exportFormat, setExportFormat] = useState<'png' | 'pdf' | 'pptx'>('pdf');
  const [exportDpi, setExportDpi] = useState(300);
  const [isExporting, setIsExporting] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  
  const {
    addElement,
    canUndo,
    canRedo,
    undo,
    redo,
    canvasSettings,
    zoom,
    setZoom,
    pages,
    activePageIndex,
    setActivePage,
    addPage,
    setPages,
  } = useEditorStore();

  const {
    saveProject,
    currentProject,
    setProjectPublic,
  } = useProjectStore();

  const { aiAnalysis, isGenerating, generatePresentation } = useAI();

  // Temporary defaults for properties not yet implemented in new stores
  const showGrid = false;
  const toggleGrid = () => {};
  const snapToGrid = false;
  const toggleSnapToGrid = () => {};
  const updateCanvasSettings = (_settings: any) => {};

  const handleAddElement = (type: string) => {
    const defaultStyle = {
      fontSize: type === 'heading' ? 32 : 16,
      fontWeight: type === 'heading' ? '700' : '400',
      color: '#1a1a1a',
      textAlign: 'center' as const,
      backgroundColor: type === 'shape' ? '#6B46C1' : 'transparent',
      borderRadius: type === 'shape' ? 8 : 0,
      padding: 16,
    };

    addElement({
      type: type as any,
      x: 100,
      y: 100,
      width: type === 'heading' ? 400 : 200,
      height: type === 'heading' ? 60 : type === 'chart' ? 200 : 50,
      content: type === 'heading' ? 'New Heading' : type === 'text' ? 'New text element' : '',
      style: defaultStyle,
    });
    
    toast.success(`${type} added`);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const canvasElement = document.querySelector('[data-infographic-canvas]') as HTMLElement | null;
      if (!canvasElement) {
        toast.error('Canvas not found');
        return;
      }

      const baseName = currentProject?.title || 'presentation';

      if (exportFormat === 'png') {
        await exportAsPNG(canvasElement, `${baseName}.png`);
        toast.success('Exported as PNG');
      } else if (exportFormat === 'pdf') {
        await exportPagesAsPDF([canvasElement], `${baseName}.pdf`, canvasSettings);
        toast.success('Exported as PDF');
      } else if (exportFormat === 'pptx') {
        await exportPagesAsPPTX(pages, [canvasElement], `${baseName}.pptx`, canvasSettings);
        toast.success('Exported as PPTX');
      }
    } catch (error) {
      console.error('Export failed', error);
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = () => {
    if (currentProject) {
      setProjectPublic(currentProject.id, true);
      const shareUrl = `${window.location.origin}/share/${currentProject.publicSlug}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard');
    }
  };

  const handleGeneratePresentation = async () => {
    if (!aiPrompt.trim()) return;
    
    try {
      const presentation = await generatePresentation(aiPrompt);
      
      // Create pages from the generated presentation
      const newPages = presentation.pages.map((page: {heading: string, content: string}) => ({
        id: crypto.randomUUID(),
        heading: page.heading,
        content: page.content,
        elements: [],
      }));
      
      setPages(newPages);
      
      toast.success('Presentation generated successfully!');
    } catch (error) {
      toast.error('Failed to generate presentation');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'elements':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Add Elements</h3>
            <div className="grid grid-cols-2 gap-2">
              {elementTypes.map((el) => (
                <motion.button
                  key={el.type}
                  onClick={() => handleAddElement(el.type)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <el.icon className="w-6 h-6 text-violet-400" />
                  <span className="text-sm text-white/80">{el.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 'layers':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Pages</h3>
            <div className="space-y-1">
              {pages.map((page, index) => (
                <motion.div
                  key={page.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    activePageIndex === index 
                      ? 'bg-violet-500/20 border border-violet-500/50' 
                      : 'bg-white/5 hover:bg-white/10 border border-transparent'
                  }`}
                  onClick={() => setActivePage(index)}
                  layout
                >
                  <span className="text-xs text-white/40 w-6">{index + 1}</span>
                  <span className="text-sm text-white/80 truncate">{page.heading}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // For now, no delete
                    }}
                    className="ml-auto text-white/40 hover:text-red-400"
                  >
                    Г—
                  </button>
                </motion.div>
              ))}
            </div>
            <button
              onClick={() => addPage()}
              className="w-full btn-primary"
            >
              Add Page
            </button>
          </div>
        );

      case 'styles':
        return (
          <div className="space-y-6">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Canvas Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">Show Grid</span>
                <Switch checked={showGrid} onCheckedChange={toggleGrid} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">Snap to Grid</span>
                <Switch checked={snapToGrid} onCheckedChange={toggleSnapToGrid} />
              </div>
              
              <div className="space-y-2">
                <span className="text-sm text-white/70">Zoom: {zoom}%</span>
                <Slider
                  value={[zoom]}
                  onValueChange={([value]) => setZoom(value)}
                  min={25}
                  max={200}
                  step={5}
                />
              </div>
              
              <div className="space-y-2">
                <span className="text-sm text-white/70">Background Color</span>
                <div className="flex gap-2">
                  {['#ffffff', '#f3f4f6', '#1a1a1a', '#6B46C1', '#EC4899', '#06B6D4'].map((color) => (
                    <button
                      key={color}
                      onClick={() => updateCanvasSettings({ backgroundColor: color })}
                      className="w-8 h-8 rounded-lg border border-white/20"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'ai':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">AI Presentation Generator</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-white/70">Presentation Topic</label>
                <textarea
                  placeholder="Describe your presentation topic..."
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 resize-none"
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
              </div>
              
              <button
                onClick={handleGeneratePresentation}
                disabled={!aiPrompt.trim() || isGenerating}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : 'Generate Presentation'}
              </button>
            </div>
            
            {aiAnalysis && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <span className="text-sm font-medium text-white">AI Analysis</span>
                  </div>
                  <p className="text-lg text-violet-300 capitalize">{aiAnalysis.detectedLayout}</p>
                  <p className="text-sm text-white/50 mt-1">
                    Confidence: {Math.round(aiAnalysis.confidence * 100)}%
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 'export':
        return (
          <div className="space-y-6">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Export Options</h3>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setExportFormat('png')}
                  className={`flex-1 py-3 rounded-xl border transition-colors ${
                    exportFormat === 'png'
                      ? 'bg-violet-500/20 border-violet-500 text-white'
                      : 'bg-white/5 border-white/10 text-white/60'
                  }`}
                >
                  PNG
                </button>
                <button
                  onClick={() => setExportFormat('pdf')}
                  className={`flex-1 py-3 rounded-xl border transition-colors ${
                    exportFormat === 'pdf'
                      ? 'bg-violet-500/20 border-violet-500 text-white'
                      : 'bg-white/5 border-white/10 text-white/60'
                  }`}
                >
                  PDF
                </button>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm text-white/70">Resolution (DPI)</span>
                <div className="flex gap-2">
                  {[72, 150, 300, 600].map((dpi) => (
                    <button
                      key={dpi}
                      onClick={() => setExportDpi(dpi)}
                      className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                        exportDpi === dpi
                          ? 'bg-white/20 text-white'
                          : 'bg-white/5 text-white/60'
                      }`}
                    >
                      {dpi}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-white/5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">Estimated size:</span>
                  <span className="text-white">{estimateFileSize(pages, exportFormat)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Dimensions:</span>
                  <span className="text-white">
                    {Math.round(canvasSettings.width * exportDpi / 72)} Г— {Math.round(canvasSettings.height * exportDpi / 72)} px
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full btn-primary disabled:opacity-50"
              >
                {isExporting ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
              </button>
              
              <button
                onClick={handleShare}
                className="w-full btn-secondary"
              >
                <Share2 className="w-4 h-4 mr-2 inline" />
                Share Project
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-80 bg-[#0F0F11] border-r border-white/10 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-white/10">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo"
        >
          <Undo className="w-4 h-4 text-white/70" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo"
        >
          <Redo className="w-4 h-4 text-white/70" />
        </button>
        <div className="w-px h-4 bg-white/10 mx-1" />
        <button
          onClick={() => setZoom(zoom - 10)}
          className="p-2 rounded-lg hover:bg-white/10"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 text-white/70" />
        </button>
        <span className="text-xs text-white/50 w-12 text-center">{zoom}%</span>
        <button
          onClick={() => setZoom(zoom + 10)}
          className="p-2 rounded-lg hover:bg-white/10"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-white/70" />
        </button>
        <div className="flex-1" />
        <button
          onClick={() => saveProject({ pages, canvasSettings })}
          className="p-2 rounded-lg hover:bg-white/10"
          title="Save"
        >
          <Save className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
              activeTab === tab.id
                ? 'text-violet-400 border-b-2 border-violet-400'
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

