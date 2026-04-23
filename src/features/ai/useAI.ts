import { useState, useCallback } from 'react';
import { aiService } from './aiService';
import type { AIGeneratedPresentation } from '@/types';

export function useAI() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePresentation = useCallback(
    async (
      prompt: string,
      options?: { slideCount?: number; tone?: string },
    ): Promise<AIGeneratedPresentation> => {
      setIsGenerating(true);
      setError(null);
      try {
        return await aiService.generatePresentation(prompt, options);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Noma‘lum xato';
        setError(msg);
        throw e;
      } finally {
        setIsGenerating(false);
      }
    },
    [],
  );

  return { isGenerating, error, generatePresentation };
}
