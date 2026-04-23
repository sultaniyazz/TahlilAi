import { supabase } from '@/integrations/supabase/client';
import type { AIGeneratedPresentation, SlideLayout } from '@/types';

export const aiService = {
  async generatePresentation(
    prompt: string,
    options?: { slideCount?: number; tone?: string },
  ): Promise<AIGeneratedPresentation> {
    const { data, error } = await supabase.functions.invoke('generate-presentation', {
      body: {
        prompt,
        slideCount: options?.slideCount ?? 8,
        tone: options?.tone ?? 'professional',
      },
    });

    if (error) throw new Error(error.message || 'AI bilan bog‘lanishda xato');
    if (!data || data.error) throw new Error(data?.error || 'AI javob bermadi');

    // Validate minimum shape
    if (!data.title || !Array.isArray(data.slides) || data.slides.length === 0) {
      throw new Error('AI noto‘g‘ri tuzilma qaytardi');
    }

    return data as AIGeneratedPresentation;
  },
};

// Sanitize layout incoming from AI
export function normalizeLayout(layout: string): SlideLayout {
  const allowed: SlideLayout[] = ['title', 'content', 'two-column', 'stats', 'quote', 'image', 'closing'];
  return (allowed as string[]).includes(layout) ? (layout as SlideLayout) : 'content';
}
