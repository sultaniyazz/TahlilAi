import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Palette, 
  Type, 
  X,
  Image as ImageLucide,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { Input } from '@/shared/ui/input';
import { toast } from 'sonner';

const fontOptions = [
  { name: 'Inter', category: 'Sans-serif' },
  { name: 'Space Grotesk', category: 'Display' },
  { name: 'Playfair Display', category: 'Serif' },
  { name: 'Roboto', category: 'Sans-serif' },
  { name: 'Montserrat', category: 'Sans-serif' },
  { name: 'Open Sans', category: 'Sans-serif' },
  { name: 'Lato', category: 'Sans-serif' },
  { name: 'Poppins', category: 'Sans-serif' },
];

const presetColors = [
  { name: 'Violet Dream', primary: '#6B46C1', secondary: '#EC4899', accent: '#06B6D4' },
  { name: 'Ocean Breeze', primary: '#0EA5E9', secondary: '#06B6D4', accent: '#10B981' },
  { name: 'Sunset Glow', primary: '#F59E0B', secondary: '#EF4444', accent: '#8B5CF6' },
  { name: 'Forest Mist', primary: '#059669', secondary: '#10B981', accent: '#84CC16' },
  { name: 'Midnight', primary: '#6366F1', secondary: '#8B5CF6', accent: '#EC4899' },
  { name: 'Cherry Blossom', primary: '#EC4899', secondary: '#F472B6', accent: '#FBBF24' },
];

export function BrandKit() {
  const { user, updateBrandKit, isLoading: authLoading } = useAuth();
  const brandKit = user?.brandKit;
  const [logoPreview, setLogoPreview] = useState<string | null>(brandKit?.logo || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const currentBrandKit = brandKit || {
    primaryColor: '#6B46C1',
    secondaryColor: '#EC4899',
    accentColor: '#06B6D4',
    fontHeading: 'Space Grotesk',
    fontBody: 'Inter',
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo must be under 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const result = event.target?.result as string;
        setLogoPreview(result);
        setIsSaving(true);
        await updateBrandKit({ ...currentBrandKit, logo: result });
        setIsSaving(false);
        toast.success('Logo uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo must be under 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const result = event.target?.result as string;
        setLogoPreview(result);
        setIsSaving(true);
        await updateBrandKit({ ...currentBrandKit, logo: result });
        setIsSaving(false);
        toast.success('Logo uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = async () => {
    setLogoPreview(null);
    setIsSaving(true);
    await updateBrandKit({ ...currentBrandKit, logo: undefined });
    setIsSaving(false);
    toast.success('Logo removed');
  };

  const applyColorPreset = async (preset: typeof presetColors[0]) => {
    setIsSaving(true);
    await updateBrandKit({
      ...currentBrandKit,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
    });
    setIsSaving(false);
    toast.success(`Applied ${preset.name} theme`);
  };

  const handleColorChange = async (colorKey: 'primaryColor' | 'secondaryColor' | 'accentColor', value: string) => {
    setIsSaving(true);
    await updateBrandKit({ ...currentBrandKit, [colorKey]: value });
    setIsSaving(false);
  };

  const handleFontChange = async (fontKey: 'fontHeading' | 'fontBody', value: string) => {
    setIsSaving(true);
    await updateBrandKit({ ...currentBrandKit, [fontKey]: value });
    setIsSaving(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto mb-4" />
          <p className="text-white/50">Loading brand kit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F11]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                Brand Kit
              </h1>
              <p className="text-white/50">
                Customize your brand colors, fonts, and logo for consistent designs
              </p>
            </div>
            {isSaving && (
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </div>
            )}
          </div>
        </motion.div>

        <div className="space-y-8">
          {/* Logo Upload */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 lg:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <ImageLucide className="w-5 h-5 text-violet-400" />
              <h2 className="text-xl font-semibold text-white">Logo</h2>
            </div>
            
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              
              {logoPreview ? (
                <div className="relative inline-block">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="max-h-32 max-w-full rounded-lg"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLogo();
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/70 mb-2">Drop your logo here or click to browse</p>
                  <p className="text-sm text-white/40">PNG, JPG or SVG up to 5MB</p>
                </>
              )}
            </div>
          </motion.section>

          {/* Color System */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 lg:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-5 h-5 text-violet-400" />
              <h2 className="text-xl font-semibold text-white">Colors</h2>
            </div>
            
            {/* Color Presets */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-white/60 mb-4">Quick Presets</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {presetColors.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyColorPreset(preset)}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-colors text-left"
                  >
                    <div className="flex gap-1 mb-2">
                      <div 
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: preset.secondary }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: preset.accent }}
                      />
                    </div>
                    <span className="text-sm text-white/70">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Custom Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-white/60 mb-2">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={currentBrandKit.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="w-12 h-12 rounded-xl border-0 cursor-pointer"
                  />
                  <Input
                    value={currentBrandKit.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="flex-1 bg-white/5 border-white/10 text-white uppercase"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-white/60 mb-2">Secondary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={currentBrandKit.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="w-12 h-12 rounded-xl border-0 cursor-pointer"
                  />
                  <Input
                    value={currentBrandKit.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="flex-1 bg-white/5 border-white/10 text-white uppercase"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-white/60 mb-2">Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={currentBrandKit.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="w-12 h-12 rounded-xl border-0 cursor-pointer"
                  />
                  <Input
                    value={currentBrandKit.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="flex-1 bg-white/5 border-white/10 text-white uppercase"
                  />
                </div>
              </div>
            </div>
            
            {/* Preview */}
            <div className="mt-8 p-6 rounded-xl bg-white/5">
              <h3 className="text-sm font-medium text-white/60 mb-4">Preview</h3>
              <div className="flex flex-wrap gap-4">
                <button 
                  className="px-6 py-3 rounded-xl text-white font-medium"
                  style={{ backgroundColor: currentBrandKit.primaryColor }}
                >
                  Primary Button
                </button>
                <button 
                  className="px-6 py-3 rounded-xl text-white font-medium"
                  style={{ backgroundColor: currentBrandKit.secondaryColor }}
                >
                  Secondary Button
                </button>
                <button 
                  className="px-6 py-3 rounded-xl text-white font-medium"
                  style={{ backgroundColor: currentBrandKit.accentColor }}
                >
                  Accent Button
                </button>
              </div>
            </div>
          </motion.section>

          {/* Typography */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 lg:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Type className="w-5 h-5 text-violet-400" />
              <h2 className="text-xl font-semibold text-white">Typography</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-white/60 mb-2">Heading Font</label>
                <select
                  value={currentBrandKit.fontHeading}
                  onChange={(e) => handleFontChange('fontHeading', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                >
                  {fontOptions.map((font) => (
                    <option key={font.name} value={font.name}>
                      {font.name} ({font.category})
                    </option>
                  ))}
                </select>
                <p 
                  className="mt-4 text-2xl"
                  style={{ fontFamily: currentBrandKit.fontHeading }}
                >
                  Heading Preview
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-white/60 mb-2">Body Font</label>
                <select
                  value={currentBrandKit.fontBody}
                  onChange={(e) => handleFontChange('fontBody', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                >
                  {fontOptions.map((font) => (
                    <option key={font.name} value={font.name}>
                      {font.name} ({font.category})
                    </option>
                  ))}
                </select>
                <p 
                  className="mt-4 text-base"
                  style={{ fontFamily: currentBrandKit.fontBody }}
                >
                  Body text preview. This is how your content will look.
                </p>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

