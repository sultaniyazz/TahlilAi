import type { AIGeneratedPresentation, SlideLayout } from '@/types';

const SUPABASE_URL = 'https://nqoqlqtcaeepjvgufzfi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_zhUrMnaw1vUQNBEi1Ts33w_FkSb0lbX';

export const aiService = {
  async generatePresentation(
    prompt: string,
    options?: { slideCount?: number; tone?: string },
  ): Promise<AIGeneratedPresentation> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-presentation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        slideCount: options?.slideCount ?? 8,
        tone: options?.tone ?? 'professional',
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Server xatosi: ${response.status} - ${err}`);
    }

    const data = await response.json();

    if (!data.title || !Array.isArray(data.slides) || data.slides.length === 0) {
      throw new Error("AI noto'g'ri tuzilma qaytardi");
    }

    return data as AIGeneratedPresentation;
  },
};

export function normalizeLayout(layout: string): SlideLayout {
  const allowed: SlideLayout[] = ['title', 'content', 'two-column', 'stats', 'quote', 'image', 'closing'];
  return (allowed as string[]).includes(layout) ? (layout as SlideLayout) : 'content';
}