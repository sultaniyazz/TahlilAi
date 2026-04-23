// Layout Generators for Different Infographic Types
import type { 
  InfographicElement, 
  CanvasSettings, 
  AIAnalysisResult,
  LayoutType,
  StatData
} from '@/types';
import { formatNumber } from './ai-engine';

// Generate elements based on layout type and AI analysis
export function generateLayout(
  layoutType: LayoutType,
  analysis: AIAnalysisResult,
  canvasSettings: CanvasSettings,
  brandColors: string[]
): InfographicElement[] {
  switch (layoutType) {
    case 'timeline':
      return generateTimelineLayout(analysis, canvasSettings, brandColors);
    case 'comparison':
      return generateComparisonLayout(analysis, canvasSettings, brandColors);
    case 'stats':
      return generateStatsLayout(analysis, canvasSettings, brandColors);
    case 'process':
      return generateProcessLayout(analysis, canvasSettings, brandColors);
    case 'hierarchy':
      return generateHierarchyLayout(analysis, canvasSettings, brandColors);
    case 'list':
    default:
      return generateListLayout(analysis, canvasSettings, brandColors);
  }
}

// Timeline Layout Generator
function generateTimelineLayout(
  analysis: AIAnalysisResult,
  canvasSettings: CanvasSettings,
  brandColors: string[]
): InfographicElement[] {
  const elements: InfographicElement[] = [];
  const { width } = canvasSettings;
  const padding = 60;
  
  // Title
  elements.push({
    id: 'title',
    type: 'heading',
    x: width / 2,
    y: padding,
    width: width - padding * 2,
    height: 60,
    content: analysis.title,
    style: {
      fontSize: 42,
      fontWeight: '700',
      color: '#1a1a1a',
      textAlign: 'center',
    },
    zIndex: 10,
  });
  
  // Subtitle if exists
  if (analysis.subtitle) {
    elements.push({
      id: 'subtitle',
      type: 'text',
      x: width / 2,
      y: padding + 70,
      width: width - padding * 2,
      height: 40,
      content: analysis.subtitle,
      style: {
        fontSize: 18,
        fontWeight: '400',
        color: '#666666',
        textAlign: 'center',
      },
      zIndex: 10,
    });
  }
  
  // Timeline line
  const timelineY = padding + 140;
  elements.push({
    id: 'timeline-line',
    type: 'shape',
    x: padding,
    y: timelineY,
    width: width - padding * 2,
    height: 4,
    content: '',
    style: {
      backgroundColor: brandColors[0],
      borderRadius: 2,
    },
    zIndex: 1,
  });
  
  // Timeline events
  const dates = analysis.dates.slice(0, 5);
  const eventSpacing = (width - padding * 2) / Math.max(dates.length - 1, 1);
  
  dates.forEach((date, index) => {
    const x = padding + eventSpacing * index;
    const isAbove = index % 2 === 0;
    const eventY = isAbove ? timelineY - 100 : timelineY + 40;
    
    // Event dot
    elements.push({
      id: `event-dot-${index}`,
      type: 'shape',
      x: x - 8,
      y: timelineY - 8,
      width: 16,
      height: 16,
      content: '',
      style: {
        backgroundColor: brandColors[index % brandColors.length],
        borderRadius: 8,
      },
      zIndex: 5,
    });
    
    // Connector line
    elements.push({
      id: `event-connector-${index}`,
      type: 'shape',
      x: x,
      y: isAbove ? timelineY - 90 : timelineY + 10,
      width: 2,
      height: 80,
      content: '',
      style: {
        backgroundColor: brandColors[index % brandColors.length],
      },
      zIndex: 2,
    });
    
    // Year label
    elements.push({
      id: `event-year-${index}`,
      type: 'text',
      x: x,
      y: eventY,
      width: 100,
      height: 30,
      content: date.date.getFullYear().toString(),
      style: {
        fontSize: 20,
        fontWeight: '700',
        color: brandColors[index % brandColors.length],
        textAlign: 'center',
      },
      zIndex: 10,
    });
    
    // Event description
    elements.push({
      id: `event-desc-${index}`,
      type: 'text',
      x: x - 60,
      y: eventY + 35,
      width: 120,
      height: 60,
      content: date.event?.slice(0, 50) || 'Event',
      style: {
        fontSize: 12,
        fontWeight: '400',
        color: '#444444',
        textAlign: 'center',
      },
      zIndex: 10,
    });
  });
  
  return elements;
}

// Comparison Layout Generator
function generateComparisonLayout(
  analysis: AIAnalysisResult,
  canvasSettings: CanvasSettings,
  brandColors: string[]
): InfographicElement[] {
  const elements: InfographicElement[] = [];
  const { width } = canvasSettings;
  const padding = 60;
  
  // Title
  elements.push({
    id: 'title',
    type: 'heading',
    x: width / 2,
    y: padding,
    width: width - padding * 2,
    height: 60,
    content: analysis.title,
    style: {
      fontSize: 42,
      fontWeight: '700',
      color: '#1a1a1a',
      textAlign: 'center',
    },
    zIndex: 10,
  });
  
  const comparison = analysis.comparisons[0];
  if (!comparison) return elements;
  
  const columnWidth = (width - padding * 3) / 2;
  const startY = padding + 100;
  
  // Left column header
  elements.push({
    id: 'left-header',
    type: 'heading',
    x: padding + columnWidth / 2,
    y: startY,
    width: columnWidth,
    height: 50,
    content: comparison.itemA,
    style: {
      fontSize: 28,
      fontWeight: '700',
      color: brandColors[0],
      textAlign: 'center',
    },
    zIndex: 10,
  });
  
  // Right column header
  elements.push({
    id: 'right-header',
    type: 'heading',
    x: padding * 2 + columnWidth * 1.5,
    y: startY,
    width: columnWidth,
    height: 50,
    content: comparison.itemB,
    style: {
      fontSize: 28,
      fontWeight: '700',
      color: brandColors[1],
      textAlign: 'center',
    },
    zIndex: 10,
  });
  
  // VS badge
  elements.push({
    id: 'vs-badge',
    type: 'shape',
    x: width / 2 - 25,
    y: startY + 10,
    width: 50,
    height: 50,
    content: 'VS',
    style: {
      backgroundColor: '#1a1a1a',
      borderRadius: 25,
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700',
      textAlign: 'center',
    },
    zIndex: 15,
  });
  
  // Comparison points
  const points = [
    'Feature A',
    'Feature B',
    'Feature C',
    'Overall',
  ];
  
  points.forEach((point, index) => {
    const y = startY + 80 + index * 70;
    
    // Point label
    elements.push({
      id: `point-label-${index}`,
      type: 'text',
      x: width / 2,
      y: y,
      width: 150,
      height: 30,
      content: point,
      style: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666666',
        textAlign: 'center',
      },
      zIndex: 10,
    });
    
    // Left value indicator
    elements.push({
      id: `left-value-${index}`,
      type: 'shape',
      x: padding,
      y: y + 30,
      width: columnWidth * (0.6 + Math.random() * 0.4),
      height: 20,
      content: '',
      style: {
        backgroundColor: brandColors[0],
        borderRadius: 10,
        opacity: 0.8,
      },
      zIndex: 5,
    });
    
    // Right value indicator
    elements.push({
      id: `right-value-${index}`,
      type: 'shape',
      x: padding * 2 + columnWidth,
      y: y + 30,
      width: columnWidth * (0.6 + Math.random() * 0.4),
      height: 20,
      content: '',
      style: {
        backgroundColor: brandColors[1],
        borderRadius: 10,
        opacity: 0.8,
      },
      zIndex: 5,
    });
  });
  
  return elements;
}

// Stats Layout Generator
function generateStatsLayout(
  analysis: AIAnalysisResult,
  canvasSettings: CanvasSettings,
  brandColors: string[]
): InfographicElement[] {
  const elements: InfographicElement[] = [];
  const { width } = canvasSettings;
  const padding = 60;
  
  // Title
  elements.push({
    id: 'title',
    type: 'heading',
    x: width / 2,
    y: padding,
    width: width - padding * 2,
    height: 60,
    content: analysis.title,
    style: {
      fontSize: 42,
      fontWeight: '700',
      color: '#1a1a1a',
      textAlign: 'center',
    },
    zIndex: 10,
  });
  
  const stats = analysis.statistics.slice(0, 4);
  const cardsPerRow = Math.min(stats.length, 2);
  const cardWidth = (width - padding * (cardsPerRow + 1)) / cardsPerRow;
  const cardHeight = 180;
  
  stats.forEach((stat, index) => {
    const row = Math.floor(index / cardsPerRow);
    const col = index % cardsPerRow;
    const x = padding + col * (cardWidth + padding);
    const y = padding + 100 + row * (cardHeight + 30);
    
    // Card background
    elements.push({
      id: `stat-card-${index}`,
      type: 'shape',
      x,
      y,
      width: cardWidth,
      height: cardHeight,
      content: '',
      style: {
        backgroundColor: brandColors[index % brandColors.length] + '15',
        borderRadius: 16,
      },
      zIndex: 1,
    });
    
    // Stat value
    elements.push({
      id: `stat-value-${index}`,
      type: 'stat',
      x: x + cardWidth / 2,
      y: y + 50,
      width: cardWidth - 40,
      height: 60,
      content: formatNumber(stat.value, stat.unit),
      style: {
        fontSize: 48,
        fontWeight: '800',
        color: brandColors[index % brandColors.length],
        textAlign: 'center',
      },
      data: {
        value: stat.value,
        label: stat.context.slice(0, 30),
        unit: stat.unit,
      } as StatData,
      zIndex: 10,
    });
    
    // Stat label
    elements.push({
      id: `stat-label-${index}`,
      type: 'text',
      x: x + cardWidth / 2,
      y: y + 120,
      width: cardWidth - 40,
      height: 40,
      content: stat.context.slice(0, 50),
      style: {
        fontSize: 14,
        fontWeight: '400',
        color: '#666666',
        textAlign: 'center',
      },
      zIndex: 10,
    });
  });
  
  return elements;
}

// Process Layout Generator
function generateProcessLayout(
  analysis: AIAnalysisResult,
  canvasSettings: CanvasSettings,
  brandColors: string[]
): InfographicElement[] {
  const elements: InfographicElement[] = [];
  const { width } = canvasSettings;
  const padding = 60;
  
  // Title
  elements.push({
    id: 'title',
    type: 'heading',
    x: width / 2,
    y: padding,
    width: width - padding * 2,
    height: 60,
    content: analysis.title,
    style: {
      fontSize: 42,
      fontWeight: '700',
      color: '#1a1a1a',
      textAlign: 'center',
    },
    zIndex: 10,
  });
  
  // Process steps
  const steps = ['Research', 'Plan', 'Execute', 'Review', 'Launch'];
  const stepWidth = (width - padding * 2) / steps.length;
  const stepY = padding + 150;
  
  steps.forEach((step, index) => {
    const x = padding + index * stepWidth + stepWidth / 2;
    
    // Step circle
    elements.push({
      id: `step-circle-${index}`,
      type: 'shape',
      x: x - 40,
      y: stepY - 40,
      width: 80,
      height: 80,
      content: (index + 1).toString(),
      style: {
        backgroundColor: brandColors[index % brandColors.length],
        borderRadius: 40,
        color: '#ffffff',
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
      },
      zIndex: 5,
    });
    
    // Step label
    elements.push({
      id: `step-label-${index}`,
      type: 'text',
      x: x,
      y: stepY + 60,
      width: stepWidth - 20,
      height: 40,
      content: step,
      style: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        textAlign: 'center',
      },
      zIndex: 10,
    });
    
    // Connector arrow (except for last step)
    if (index < steps.length - 1) {
      elements.push({
        id: `step-connector-${index}`,
        type: 'shape',
        x: x + 45,
        y: stepY - 5,
        width: stepWidth - 90,
        height: 10,
        content: '',
        style: {
          backgroundColor: brandColors[index % brandColors.length] + '50',
          borderRadius: 5,
        },
        zIndex: 1,
      });
    }
  });
  
  return elements;
}

// Hierarchy Layout Generator
function generateHierarchyLayout(
  analysis: AIAnalysisResult,
  canvasSettings: CanvasSettings,
  brandColors: string[]
): InfographicElement[] {
  const elements: InfographicElement[] = [];
  const { width } = canvasSettings;
  const padding = 60;
  
  // Title
  elements.push({
    id: 'title',
    type: 'heading',
    x: width / 2,
    y: padding,
    width: width - padding * 2,
    height: 60,
    content: analysis.title,
    style: {
      fontSize: 42,
      fontWeight: '700',
      color: '#1a1a1a',
      textAlign: 'center',
    },
    zIndex: 10,
  });
  
  // Org chart structure
  const levels = [
    [{ name: 'CEO', role: 'Chief Executive' }],
    [{ name: 'CTO', role: 'Technology' }, { name: 'CMO', role: 'Marketing' }],
    [{ name: 'Dev', role: 'Development' }, { name: 'Design', role: 'Design' }, { name: 'Sales', role: 'Sales' }],
  ];
  
  const levelHeight = 120;
  const startY = padding + 120;
  
  levels.forEach((level, levelIndex) => {
    const y = startY + levelIndex * levelHeight;
    const itemWidth = (width - padding * 2) / level.length;
    
    level.forEach((item, itemIndex) => {
      const x = padding + itemIndex * itemWidth + itemWidth / 2;
      
      // Box
      elements.push({
        id: `hierarchy-box-${levelIndex}-${itemIndex}`,
        type: 'shape',
        x: x - itemWidth / 2 + 10,
        y: y - 35,
        width: itemWidth - 20,
        height: 70,
        content: '',
        style: {
          backgroundColor: brandColors[levelIndex % brandColors.length] + '20',
          borderRadius: 12,
        },
        zIndex: 5,
      });
      
      // Name
      elements.push({
        id: `hierarchy-name-${levelIndex}-${itemIndex}`,
        type: 'text',
        x,
        y: y - 10,
        width: itemWidth - 30,
        height: 25,
        content: item.name,
        style: {
          fontSize: 16,
          fontWeight: '700',
          color: '#1a1a1a',
          textAlign: 'center',
        },
        zIndex: 10,
      });
      
      // Role
      elements.push({
        id: `hierarchy-role-${levelIndex}-${itemIndex}`,
        type: 'text',
        x,
        y: y + 15,
        width: itemWidth - 30,
        height: 20,
        content: item.role,
        style: {
          fontSize: 12,
          fontWeight: '400',
          color: '#666666',
          textAlign: 'center',
        },
        zIndex: 10,
      });
      
      // Connector to parent
      if (levelIndex > 0) {
        const parentLevel = levels[levelIndex - 1];
        const parentIndex = Math.min(itemIndex, parentLevel.length - 1);
        const parentX = padding + parentIndex * ((width - padding * 2) / parentLevel.length) + ((width - padding * 2) / parentLevel.length) / 2;
        const parentY = startY + (levelIndex - 1) * levelHeight + 35;
        
        elements.push({
          id: `hierarchy-connector-${levelIndex}-${itemIndex}`,
          type: 'shape',
          x: Math.min(x, parentX),
          y: parentY,
          width: Math.abs(x - parentX),
          height: 2,
          content: '',
          style: {
            backgroundColor: brandColors[levelIndex % brandColors.length] + '50',
          },
          zIndex: 1,
        });
        
        elements.push({
          id: `hierarchy-connector-v-${levelIndex}-${itemIndex}`,
          type: 'shape',
          x: x,
          y: parentY,
          width: 2,
          height: y - 35 - parentY,
          content: '',
          style: {
            backgroundColor: brandColors[levelIndex % brandColors.length] + '50',
          },
          zIndex: 1,
        });
      }
    });
  });
  
  return elements;
}

// List Layout Generator
function generateListLayout(
  analysis: AIAnalysisResult,
  canvasSettings: CanvasSettings,
  brandColors: string[]
): InfographicElement[] {
  const elements: InfographicElement[] = [];
  const { width } = canvasSettings;
  const padding = 60;
  
  // Title
  elements.push({
    id: 'title',
    type: 'heading',
    x: width / 2,
    y: padding,
    width: width - padding * 2,
    height: 60,
    content: analysis.title,
    style: {
      fontSize: 42,
      fontWeight: '700',
      color: '#1a1a1a',
      textAlign: 'center',
    },
    zIndex: 10,
  });
  
  // Subtitle
  if (analysis.subtitle) {
    elements.push({
      id: 'subtitle',
      type: 'text',
      x: width / 2,
      y: padding + 70,
      width: width - padding * 2,
      height: 40,
      content: analysis.subtitle,
      style: {
        fontSize: 18,
        fontWeight: '400',
        color: '#666666',
        textAlign: 'center',
      },
      zIndex: 10,
    });
  }
  
  // List items based on topics or statistics
  const items = analysis.topics.slice(0, 5).map((topic, i) => ({
    title: topic.charAt(0).toUpperCase() + topic.slice(1),
    description: `Key insights about ${topic}`,
    icon: analysis.suggestedIcons[i] || 'check-circle',
  }));
  
  if (items.length === 0) {
    items.push(
      { title: 'Key Point 1', description: 'Important information', icon: 'check-circle' },
      { title: 'Key Point 2', description: 'Critical data', icon: 'star' },
      { title: 'Key Point 3', description: 'Essential insight', icon: 'zap' }
    );
  }
  
  const itemHeight = 100;
  const startY = padding + 140;
  
  items.forEach((item, index) => {
    const y = startY + index * itemHeight;
    
    // Icon circle
    elements.push({
      id: `list-icon-${index}`,
      type: 'shape',
      x: padding,
      y: y,
      width: 50,
      height: 50,
      content: '',
      style: {
        backgroundColor: brandColors[index % brandColors.length],
        borderRadius: 25,
      },
      zIndex: 5,
    });
    
    // Item title
    elements.push({
      id: `list-title-${index}`,
      type: 'heading',
      x: padding + 70,
      y: y + 5,
      width: width - padding * 2 - 70,
      height: 30,
      content: item.title,
      style: {
        fontSize: 22,
        fontWeight: '600',
        color: '#1a1a1a',
      },
      zIndex: 10,
    });
    
    // Item description
    elements.push({
      id: `list-desc-${index}`,
      type: 'text',
      x: padding + 70,
      y: y + 35,
      width: width - padding * 2 - 70,
      height: 40,
      content: item.description,
      style: {
        fontSize: 14,
        fontWeight: '400',
        color: '#666666',
      },
      zIndex: 10,
    });
    
    // Divider line
    if (index < items.length - 1) {
      elements.push({
        id: `list-divider-${index}`,
        type: 'shape',
        x: padding + 70,
        y: y + 90,
        width: width - padding * 2 - 70,
        height: 1,
        content: '',
        style: {
          backgroundColor: '#e5e5e5',
        },
        zIndex: 1,
      });
    }
  });
  
  return elements;
}

export default {
  generateLayout,
};
