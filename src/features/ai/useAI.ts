import { useCallback, useState } from 'react';
import type { AIAnalysisResult, PresentationData } from './aiService';
import { aiService } from './aiService';

export function useAI() {
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const analyzeContent = useCallback(async (content: string) => {
    setIsAnalyzing(true);
    try {
      const analysis = await aiService.analyzeContent(content);
      setAIAnalysis(analysis);
      return analysis;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const generatePresentation = useCallback(async (prompt: string): Promise<PresentationData> => {
    setIsGenerating(true);
    try {
      const presentation = await aiService.generatePresentation(prompt);
      return presentation;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    aiAnalysis,
    isAnalyzing,
    analyzeContent,
    isGenerating,
    generatePresentation,
  };
}
