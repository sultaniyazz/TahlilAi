import { supabase } from '@/integrations/supabase/client';
import type { PresentationData, AIAnalysisResult } from '@/types';

export type { PresentationData, AIAnalysisResult };

export interface GeneratedSlide {
  heading: string;
  content: string;
  bullets?: string[];
  layout?: string;
  notes?: string;
}

export interface GeneratedPresentation {
  title: string;
  subtitle?: string;
  pages: GeneratedSlide[];
  suggestedTheme?: {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    fontHeading: string;
    fontBody: string;
  };
}

export interface GenerateOptions {
  slideCount?: number;
  tone?: 'professional' | 'casual' | 'academic' | 'creative' | 'persuasive';
  language?: string;
  audience?: string;
}

export const aiService = {
  async generatePresentation(
    prompt: string,
    options: GenerateOptions = {}
  ): Promise<GeneratedPresentation> {
    const { data, error } = await supabase.functions.invoke('generate-presentation', {
      body: {
        prompt,
        slideCount: options.slideCount ?? 8,
        tone: options.tone ?? 'professional',
        language: options.language,
        audience: options.audience,
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to generate presentation');
    }
    if (!data || data.error) {
      throw new Error(data?.error || 'Failed to generate presentation');
    }
    if (!data.title || !Array.isArray(data.pages)) {
      throw new Error('Invalid presentation structure returned');
    }

    return data as GeneratedPresentation;
  },

  async analyzeContent(content: string): Promise<AIAnalysisResult> {
    // Lightweight client-side heuristic. Heavy AI moved to edge functions.
    const numericMatches = Array.from(content.matchAll(/(\d[\d,.]*)/g)).slice(0, 3);
    const stats = numericMatches.map((match) => ({
      value: parseFloat(match[1].replace(/,/g, '')) || 0,
      originalText: match[0],
      context: 'Detected value',
    }));

    const dateMatches = Array.from(
      content.matchAll(/\b(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4})\b/g)
    ).slice(0, 2);
    const dates = dateMatches
      .map((match) => ({ date: new Date(match[1]), originalText: match[0] }))
      .filter((entry) => !isNaN(entry.date.getTime()));

    return {
      detectedLayout: 'list',
      confidence: Math.min(0.95, 0.5 + stats.length * 0.1),
      title: content.split('\n')[0] || 'Infographic summary',
      statistics: stats,
      dates,
      comparisons: [],
      topics: content
        .split(/\.|\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 30)
        .slice(0, 3),
      suggestedIcons: ['Sparkles', 'ChartPie', 'TrendingUp', 'Clock', 'Users'].slice(0, 4),
      suggestedColors: ['#6B46C1', '#EC4899', '#06B6D4'],
    };
  },
};
