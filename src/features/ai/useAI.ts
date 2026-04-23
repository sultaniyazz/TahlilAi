import { useCallback, useState } from 'react';
import { aiService } from './aiService';
import type {
  AIAnalysisResult,
  GeneratedPresentation,
  GenerateOptions,
} from './aiService';

export function useAI() {
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeContent = useCallback(async (content: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = await aiService.analyzeContent(content);
      setAIAnalysis(analysis);
      return analysis;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Analysis failed';
      setError(msg);
      throw e;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const generatePresentation = useCallback(
    async (
      prompt: string,
      options: GenerateOptions = {}
    ): Promise<GeneratedPresentation> => {
      setIsGenerating(true);
      setError(null);
      try {
        return await aiService.generatePresentation(prompt, options);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Generation failed';
        setError(msg);
        throw e;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  return {
    aiAnalysis,
    isAnalyzing,
    analyzeContent,
    isGenerating,
    generatePresentation,
    error,
  };
}
