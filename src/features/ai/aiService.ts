import type { PresentationData, AIAnalysisResult } from '@/types';

export type { PresentationData, AIAnalysisResult };

export const aiService = {
  async generatePresentation(prompt: string): Promise<PresentationData> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are an AI presentation generator. Generate a structured presentation with title and pages. Each page should have a heading and content. Return ONLY valid JSON in this format:
{
  "title": "Presentation Title",
  "pages": [
    {
      "heading": "Slide Heading",
      "content": "Slide content here"
    }
  ]
}
Keep content concise, professional, and engaging. Generate 5-8 pages for a complete presentation.`,
            },
            {
              role: 'user',
              content: `Create a presentation about: ${prompt}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      // Parse the JSON response
      const presentationData: PresentationData = JSON.parse(content);

      // Validate the structure
      if (!presentationData.title || !Array.isArray(presentationData.pages)) {
        throw new Error('Invalid presentation structure');
      }

      return presentationData;
    } catch (error) {
      console.error('Error generating presentation:', error);
      throw new Error('Failed to generate presentation. Please try again.');
    }
  },

  async analyzeContent(content: string): Promise<AIAnalysisResult> {
    const numericMatches = Array.from(content.matchAll(/(\d[\d,\.]*)/g)).slice(0, 3);
    const stats = numericMatches.map((match) => ({
      value: parseFloat(match[1].replace(/,/g, '')) || 0,
      originalText: match[0],
      context: 'Detected value',
    }));

    const dateMatches = Array.from(content.matchAll(/\b(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4})\b/g)).slice(0, 2);
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
