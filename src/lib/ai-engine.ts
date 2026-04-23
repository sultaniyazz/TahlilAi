// AI Engine for InfoGraphic Intelligence
// Detects statistics, dates, comparisons, and suggests layouts

import type { 
  AIAnalysisResult, 
  DetectedStatistic, 
  DetectedDate, 
  DetectedComparison,
  LayoutType,
} from '@/types';
import { parse, isValid } from 'date-fns';

// Icon recommendations based on topics
const topicIconMap: Record<string, string[]> = {
  business: ['trending-up', 'bar-chart-2', 'pie-chart', 'dollar-sign', 'briefcase'],
  marketing: ['megaphone', 'target', 'users', 'share-2', 'trending-up'],
  education: ['book-open', 'graduation-cap', 'lightbulb', 'brain', 'users'],
  health: ['heart', 'activity', 'shield', 'user-check', 'smile'],
  technology: ['cpu', 'code', 'smartphone', 'wifi', 'database'],
  finance: ['dollar-sign', 'trending-up', 'wallet', 'credit-card', 'piggy-bank'],
  environment: ['leaf', 'sun', 'wind', 'droplets', 'globe'],
  travel: ['map', 'plane', 'compass', 'camera', 'mountain'],
  food: ['utensils', 'coffee', 'pizza', 'apple', 'chef-hat'],
  sports: ['trophy', 'activity', 'dumbbell', 'flag', 'timer'],
  science: ['atom', 'microscope', 'flask', 'dna', 'rocket'],
  music: ['music', 'mic', 'headphones', 'radio', 'guitar'],
  default: ['sparkles', 'zap', 'star', 'check-circle', 'info'],
};

// Color palettes based on topics
const topicColorMap: Record<string, string[]> = {
  business: ['#6B46C1', '#8B5CF6', '#A78BFA', '#C4B5FD'],
  marketing: ['#EC4899', '#F472B6', '#F9A8D4', '#FBCFE8'],
  education: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'],
  health: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
  technology: ['#06B6D4', '#22D3EE', '#67E8F9', '#A5F3FC'],
  finance: ['#059669', '#10B981', '#34D399', '#6EE7B7'],
  environment: ['#16A34A', '#22C55E', '#4ADE80', '#86EFAC'],
  travel: ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A'],
  food: ['#EF4444', '#F87171', '#FCA5A5', '#FECACA'],
  sports: ['#DC2626', '#EF4444', '#F87171', '#FCA5A5'],
  science: ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE'],
  music: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'],
  default: ['#6B46C1', '#EC4899', '#06B6D4', '#10B981'],
};

// Comparison keywords
const comparisonKeywords = [
  'vs', 'versus', 'compared to', 'unlike', 'while', 'whereas',
  'difference between', 'similarities', 'better than', 'worse than',
  'more than', 'less than', 'higher than', 'lower than',
  'advantages', 'disadvantages', 'pros', 'cons', 'benefits', 'drawbacks',
];

// Timeline keywords
const timelineKeywords = [
  'in', 'on', 'at', 'during', 'before', 'after', 'since', 'until',
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
  'year', 'month', 'week', 'day', 'century', 'decade',
  'first', 'second', 'third', 'fourth', 'fifth',
  'initially', 'finally', 'eventually', 'subsequently', 'afterward',
  'history', 'timeline', 'evolution', 'development', 'progress',
];

// Process keywords
const processKeywords = [
  'step', 'stage', 'phase', 'process', 'procedure', 'method',
  'first', 'then', 'next', 'after', 'finally', 'lastly',
  'how to', 'guide', 'tutorial', 'instructions', 'workflow',
];

/**
 * Main text analysis function
 */
export function analyzeText(text: string): AIAnalysisResult {
  const statistics = detectStatistics(text);
  const dates = detectDates(text);
  const comparisons = detectComparisons(text);
  const topics = detectTopics(text);
  const layout = determineLayout(text, statistics, dates, comparisons);
  const suggestedIcons = generateIconSuggestions(topics, text);
  const suggestedColors = generateColorSuggestions(topics);
  const { title, subtitle } = generateTitles(text);

  return {
    detectedLayout: layout,
    confidence: calculateConfidence(statistics, dates, comparisons, topics),
    title,
    subtitle,
    statistics,
    dates,
    comparisons,
    topics,
    suggestedIcons,
    suggestedColors,
  };
}

/**
 * Detect statistics in text
 */
function detectStatistics(text: string): DetectedStatistic[] {
  const statistics: DetectedStatistic[] = [];
  const seen = new Set<string>();

  // Percentage detection
  const percentRegex = /(\d+(?:\.\d+)?)\s*%/g;
  let match: RegExpExecArray | null;
  while ((match = percentRegex.exec(text)) !== null) {
    const key = match[0] + match.index;
    if (!seen.has(key)) {
      seen.add(key);
      statistics.push({
        value: parseFloat(match[1]),
        originalText: match[0],
        context: extractContext(text, match.index, match[0].length),
        unit: '%',
      });
    }
  }

  // Currency detection
  const currencyRegex = /[\$€£¥]\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*(million|billion|trillion)?/gi;
  while ((match = currencyRegex.exec(text)) !== null) {
    const key = match[0] + match.index;
    if (!seen.has(key)) {
      seen.add(key);
      let value = parseFloat(match[1].replace(/,/g, ''));
      const multiplier = match[2]?.toLowerCase();
      if (multiplier === 'million') value *= 1000000;
      if (multiplier === 'billion') value *= 1000000000;
      if (multiplier === 'trillion') value *= 1000000000000;
      
      statistics.push({
        value,
        originalText: match[0],
        context: extractContext(text, match.index, match[0].length),
        unit: match[0][0],
      });
    }
  }

  // Large numbers with context
  const numberRegex = /\b(\d{1,3}(?:,\d{3})+(?:\.\d+)?)\s*(million|billion|trillion)?\b/gi;
  while ((match = numberRegex.exec(text)) !== null) {
    const key = match[0] + match.index;
    if (!seen.has(key) && !text.substring(Math.max(0, match.index - 10), match.index).includes('$')) {
      seen.add(key);
      let value = parseFloat(match[1].replace(/,/g, ''));
      const multiplier = match[2]?.toLowerCase();
      if (multiplier === 'million') value *= 1000000;
      if (multiplier === 'billion') value *= 1000000000;
      if (multiplier === 'trillion') value *= 1000000000000;
      
      statistics.push({
        value,
        originalText: match[0],
        context: extractContext(text, match.index, match[0].length),
        unit: match[2] || '',
      });
    }
  }

  return statistics;
}

/**
 * Detect dates in text
 */
function detectDates(text: string): DetectedDate[] {
  const dates: DetectedDate[] = [];
  const seen = new Set<string>();

  // Year detection (1900-2099)
  const yearRegex = /\b(19|20)\d{2}\b/g;
  let match: RegExpExecArray | null;
  while ((match = yearRegex.exec(text)) !== null) {
    const key = match[0] + match.index;
    if (!seen.has(key)) {
      seen.add(key);
      const year = parseInt(match[0]);
      dates.push({
        date: new Date(year, 0, 1),
        originalText: match[0],
        event: extractContext(text, match.index, match[0].length),
      });
    }
  }

  // Full date detection
  const fullDateRegex = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/gi;
  while ((match = fullDateRegex.exec(text)) !== null) {
    const key = match[0] + match.index;
    if (!seen.has(key)) {
      seen.add(key);
      const date = parse(match[0], 'MMMM d, yyyy', new Date());
      if (isValid(date)) {
        dates.push({
          date,
          originalText: match[0],
          event: extractContext(text, match.index, match[0].length),
        });
      }
    }
  }

  // Sort by date
  return dates.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Detect comparisons in text
 */
function detectComparisons(text: string): DetectedComparison[] {
  const comparisons: DetectedComparison[] = [];

  // Look for "X vs Y" patterns
  const vsRegex = /(\w+(?:\s+\w+){0,3})\s+(?:vs\.?|versus)\s+(\w+(?:\s+\w+){0,3})/gi;
  let match: RegExpExecArray | null;
  while ((match = vsRegex.exec(text)) !== null) {
    comparisons.push({
      itemA: match[1].trim(),
      itemB: match[2].trim(),
      contrastPoint: extractContext(text, match.index, match[0].length),
    });
  }

  // Look for "compared to" patterns
  const comparedRegex = /(\w+(?:\s+\w+){0,3})\s+(?:compared to|unlike|while|whereas)\s+(\w+(?:\s+\w+){0,3})/gi;
  while ((match = comparedRegex.exec(text)) !== null) {
    // Avoid duplicates
    const isDuplicate = comparisons.some(
      c => (c.itemA === match![1].trim() && c.itemB === match![2].trim()) ||
           (c.itemA === match![2].trim() && c.itemB === match![1].trim())
    );
    if (!isDuplicate) {
      comparisons.push({
        itemA: match[1].trim(),
        itemB: match[2].trim(),
        contrastPoint: extractContext(text, match.index, match[0].length),
      });
    }
  }

  return comparisons;
}

/**
 * Detect topics in text
 */
function detectTopics(text: string): string[] {
  const lowerText = text.toLowerCase();
  const detectedTopics: string[] = [];

  for (const [topic, keywords] of Object.entries(topicIconMap)) {
    if (topic === 'default') continue;
    
    const matchCount = keywords.filter(keyword => {
      const regex = new RegExp(`\\b${keyword.replace('-', ' ')}\\b`, 'i');
      return regex.test(lowerText) || lowerText.includes(topic);
    }).length;

    if (matchCount > 0 || lowerText.includes(topic)) {
      detectedTopics.push(topic);
    }
  }

  return detectedTopics.length > 0 ? detectedTopics : ['default'];
}

/**
 * Determine the best layout based on content analysis
 */
function determineLayout(
  text: string,
  statistics: DetectedStatistic[],
  dates: DetectedDate[],
  comparisons: DetectedComparison[]
): LayoutType {
  const lowerText = text.toLowerCase();
  
  // Check for explicit layout hints
  if (timelineKeywords.some(kw => lowerText.includes(kw)) && dates.length >= 2) {
    return 'timeline';
  }
  
  if (comparisons.length > 0 || comparisonKeywords.some(kw => lowerText.includes(kw))) {
    return 'comparison';
  }
  
  if (processKeywords.some(kw => lowerText.includes(kw))) {
    return 'process';
  }
  
  if (statistics.length >= 3) {
    return 'stats';
  }
  
  // Check for hierarchy indicators
  if (/\b(ceo|manager|director|head of|team lead)\b/i.test(text)) {
    return 'hierarchy';
  }
  
  // Default to list layout
  return 'list';
}

/**
 * Generate icon suggestions based on topics
 */
function generateIconSuggestions(topics: string[], text: string): string[] {
  const icons: string[] = [];
  
  for (const topic of topics) {
    const topicIcons = topicIconMap[topic] || topicIconMap.default;
    icons.push(...topicIcons);
  }
  
  // Add context-specific icons based on text content
  const lowerText = text.toLowerCase();
  if (lowerText.includes('growth') || lowerText.includes('increase')) {
    icons.unshift('trending-up');
  }
  if (lowerText.includes('decrease') || lowerText.includes('decline')) {
    icons.unshift('trending-down');
  }
  if (lowerText.includes('goal') || lowerText.includes('target')) {
    icons.unshift('target');
  }
  
  // Return unique icons, limited to 6
  return [...new Set(icons)].slice(0, 6);
}

/**
 * Generate color suggestions based on topics
 */
function generateColorSuggestions(topics: string[]): string[] {
  const colors: string[] = [];
  
  for (const topic of topics) {
    const topicColors = topicColorMap[topic] || topicColorMap.default;
    colors.push(...topicColors);
  }
  
  // Return unique colors, limited to 4
  return [...new Set(colors)].slice(0, 4);
}

/**
 * Generate title and subtitle from text
 */
function generateTitles(text: string): { title: string; subtitle?: string } {
  // Try to extract the first sentence as title
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length === 0) {
    return { title: 'Untitled Infographic' };
  }
  
  const firstSentence = sentences[0].trim();
  
  // If first sentence is short enough, use it as title
  if (firstSentence.length <= 60) {
    const title = firstSentence.charAt(0).toUpperCase() + firstSentence.slice(1);
    const subtitle = sentences.length > 1 ? sentences[1].trim().slice(0, 100) + '...' : undefined;
    return { title, subtitle };
  }
  
  // Otherwise, extract key phrase or use first few words
  const words = firstSentence.split(' ');
  const title = words.slice(0, 8).join(' ') + (words.length > 8 ? '...' : '');
  const subtitle = words.slice(8, 16).join(' ') + (words.length > 16 ? '...' : '');
  
  return { title, subtitle };
}

/**
 * Extract surrounding context for a match
 */
function extractContext(text: string, index: number, length: number, window: number = 40): string {
  const start = Math.max(0, index - window);
  const end = Math.min(text.length, index + length + window);
  return text.substring(start, end).replace(/^\s+|\s+$/g, '');
}

/**
 * Calculate confidence score for the analysis
 */
function calculateConfidence(
  statistics: DetectedStatistic[],
  dates: DetectedDate[],
  comparisons: DetectedComparison[],
  topics: string[]
): number {
  let score = 0.5; // Base confidence
  
  // More data points = higher confidence
  score += Math.min(statistics.length * 0.1, 0.2);
  score += Math.min(dates.length * 0.1, 0.2);
  score += Math.min(comparisons.length * 0.15, 0.2);
  
  // Having a detected topic increases confidence
  if (topics.length > 0 && !topics.includes('default')) {
    score += 0.1;
  }
  
  return Math.min(score, 1);
}

/**
 * Generate visual hierarchy based on content
 */
export function generateVisualHierarchy(text: string) {
  const wordCount = text.split(/\s+/).length;
  
  return {
    h1: {
      fontSize: wordCount > 100 ? 48 : 64,
      fontWeight: 700,
      lineHeight: 1.2,
      marginBottom: 24,
    },
    h2: {
      fontSize: wordCount > 100 ? 32 : 40,
      fontWeight: 600,
      lineHeight: 1.3,
      marginBottom: 16,
    },
    h3: {
      fontSize: wordCount > 100 ? 24 : 28,
      fontWeight: 600,
      lineHeight: 1.4,
      marginBottom: 12,
    },
    body: {
      fontSize: wordCount > 200 ? 14 : 16,
      fontWeight: 400,
      lineHeight: 1.6,
      marginBottom: 8,
    },
    caption: {
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: 0.5,
    },
  };
}

/**
 * Format number for display
 */
export function formatNumber(value: number, unit?: string): string {
  if (unit === '%') {
    return `${value}%`;
  }
  
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  
  return value.toLocaleString();
}

export default {
  analyzeText,
  generateVisualHierarchy,
  formatNumber,
};
