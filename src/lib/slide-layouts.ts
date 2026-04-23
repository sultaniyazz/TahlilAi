// Slide layout templates - converts AI-generated slide structure to positioned elements
import type { Slide, SlideElement, AIGeneratedSlide, Theme } from '@/types';

const CANVAS_W = 1920;
const CANVAS_H = 1080;

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export function buildSlideFromAI(ai: AIGeneratedSlide, theme: Theme): Slide {
  const elements = generateElementsByLayout(ai, theme);
  return {
    id: uid(),
    title: ai.title,
    layout: ai.layout,
    background: theme.background,
    elements,
    notes: ai.notes,
  };
}

function generateElementsByLayout(ai: AIGeneratedSlide, theme: Theme): SlideElement[] {
  switch (ai.layout) {
    case 'title':
      return titleLayout(ai, theme);
    case 'two-column':
      return twoColumnLayout(ai, theme);
    case 'stats':
      return statsLayout(ai, theme);
    case 'quote':
      return quoteLayout(ai, theme);
    case 'closing':
      return closingLayout(ai, theme);
    case 'content':
    default:
      return contentLayout(ai, theme);
  }
}

function titleLayout(ai: AIGeneratedSlide, theme: Theme): SlideElement[] {
  return [
    {
      id: uid(),
      type: 'shape',
      shapeType: 'rectangle',
      x: 0,
      y: 0,
      width: 12,
      height: CANVAS_H,
      zIndex: 1,
      content: '',
      style: { backgroundColor: theme.primary },
    },
    {
      id: uid(),
      type: 'heading',
      x: 120,
      y: 380,
      width: 1680,
      height: 240,
      zIndex: 5,
      content: ai.title,
      style: {
        fontSize: 96,
        fontFamily: theme.fontHeading,
        fontWeight: 800,
        color: '#FFFFFF',
        textAlign: 'left',
        lineHeight: 1.1,
      },
    },
    {
      id: uid(),
      type: 'text',
      x: 120,
      y: 640,
      width: 1680,
      height: 100,
      zIndex: 5,
      content: ai.bullets[0] ?? '',
      style: {
        fontSize: 32,
        fontFamily: theme.fontBody,
        fontWeight: 400,
        color: theme.accent,
        textAlign: 'left',
        lineHeight: 1.4,
      },
    },
  ];
}

function contentLayout(ai: AIGeneratedSlide, theme: Theme): SlideElement[] {
  const elements: SlideElement[] = [
    {
      id: uid(),
      type: 'heading',
      x: 120,
      y: 100,
      width: 1680,
      height: 130,
      zIndex: 5,
      content: ai.title,
      style: {
        fontSize: 64,
        fontFamily: theme.fontHeading,
        fontWeight: 700,
        color: '#FFFFFF',
        textAlign: 'left',
        lineHeight: 1.2,
      },
    },
    {
      id: uid(),
      type: 'shape',
      shapeType: 'rectangle',
      x: 120,
      y: 240,
      width: 80,
      height: 6,
      zIndex: 5,
      content: '',
      style: { backgroundColor: theme.primary, borderRadius: 3 },
    },
  ];

  const bulletStartY = 320;
  const bulletGap = 130;
  ai.bullets.slice(0, 5).forEach((bullet, i) => {
    elements.push({
      id: uid(),
      type: 'shape',
      shapeType: 'circle',
      x: 130,
      y: bulletStartY + i * bulletGap + 20,
      width: 16,
      height: 16,
      zIndex: 5,
      content: '',
      style: { backgroundColor: theme.accent, borderRadius: 50 },
    });
    elements.push({
      id: uid(),
      type: 'bullet',
      x: 180,
      y: bulletStartY + i * bulletGap,
      width: 1620,
      height: 100,
      zIndex: 5,
      content: bullet,
      style: {
        fontSize: 32,
        fontFamily: theme.fontBody,
        fontWeight: 400,
        color: '#E5E7EB',
        textAlign: 'left',
        lineHeight: 1.4,
      },
    });
  });
  return elements;
}

function twoColumnLayout(ai: AIGeneratedSlide, theme: Theme): SlideElement[] {
  const elements: SlideElement[] = [
    {
      id: uid(),
      type: 'heading',
      x: 120,
      y: 100,
      width: 1680,
      height: 130,
      zIndex: 5,
      content: ai.title,
      style: {
        fontSize: 64,
        fontFamily: theme.fontHeading,
        fontWeight: 700,
        color: '#FFFFFF',
        textAlign: 'left',
      },
    },
  ];
  const leftBullets = ai.bullets.slice(0, Math.ceil(ai.bullets.length / 2));
  const rightBullets = ai.bullets.slice(Math.ceil(ai.bullets.length / 2));

  leftBullets.forEach((b, i) => {
    elements.push({
      id: uid(),
      type: 'bullet',
      x: 120,
      y: 320 + i * 140,
      width: 800,
      height: 120,
      zIndex: 5,
      content: `• ${b}`,
      style: {
        fontSize: 28,
        fontFamily: theme.fontBody,
        color: '#E5E7EB',
        textAlign: 'left',
        lineHeight: 1.4,
      },
    });
  });
  rightBullets.forEach((b, i) => {
    elements.push({
      id: uid(),
      type: 'bullet',
      x: 1000,
      y: 320 + i * 140,
      width: 800,
      height: 120,
      zIndex: 5,
      content: `• ${b}`,
      style: {
        fontSize: 28,
        fontFamily: theme.fontBody,
        color: '#E5E7EB',
        textAlign: 'left',
        lineHeight: 1.4,
      },
    });
  });
  return elements;
}

function statsLayout(ai: AIGeneratedSlide, theme: Theme): SlideElement[] {
  const elements: SlideElement[] = [
    {
      id: uid(),
      type: 'heading',
      x: 120,
      y: 100,
      width: 1680,
      height: 130,
      zIndex: 5,
      content: ai.title,
      style: {
        fontSize: 64,
        fontFamily: theme.fontHeading,
        fontWeight: 700,
        color: '#FFFFFF',
        textAlign: 'center',
      },
    },
  ];
  const statCount = Math.min(ai.bullets.length, 4);
  const cardW = (CANVAS_W - 240 - (statCount - 1) * 40) / statCount;
  const colors = [theme.primary, theme.secondary, theme.accent, '#10B981'];
  ai.bullets.slice(0, statCount).forEach((b, i) => {
    const x = 120 + i * (cardW + 40);
    elements.push({
      id: uid(),
      type: 'shape',
      shapeType: 'rectangle',
      x,
      y: 360,
      width: cardW,
      height: 360,
      zIndex: 4,
      content: '',
      style: { backgroundColor: colors[i] + '22', borderRadius: 24 },
    });
    elements.push({
      id: uid(),
      type: 'text',
      x,
      y: 420,
      width: cardW,
      height: 120,
      zIndex: 5,
      content: b.split(' ')[0] ?? '•',
      style: {
        fontSize: 96,
        fontFamily: theme.fontHeading,
        fontWeight: 800,
        color: colors[i],
        textAlign: 'center',
      },
    });
    elements.push({
      id: uid(),
      type: 'text',
      x: x + 20,
      y: 580,
      width: cardW - 40,
      height: 120,
      zIndex: 5,
      content: b.split(' ').slice(1).join(' ') || b,
      style: {
        fontSize: 22,
        fontFamily: theme.fontBody,
        color: '#E5E7EB',
        textAlign: 'center',
        lineHeight: 1.4,
      },
    });
  });
  return elements;
}

function quoteLayout(ai: AIGeneratedSlide, theme: Theme): SlideElement[] {
  return [
    {
      id: uid(),
      type: 'text',
      x: 120,
      y: 200,
      width: 200,
      height: 200,
      zIndex: 4,
      content: '"',
      style: {
        fontSize: 240,
        fontFamily: theme.fontHeading,
        fontWeight: 800,
        color: theme.primary,
        textAlign: 'left',
        opacity: 0.4,
      },
    },
    {
      id: uid(),
      type: 'heading',
      x: 240,
      y: 360,
      width: 1440,
      height: 360,
      zIndex: 5,
      content: ai.bullets[0] ?? ai.title,
      style: {
        fontSize: 56,
        fontFamily: theme.fontHeading,
        fontWeight: 600,
        color: '#FFFFFF',
        textAlign: 'left',
        lineHeight: 1.3,
        fontStyle: 'italic',
      },
    },
    {
      id: uid(),
      type: 'text',
      x: 240,
      y: 760,
      width: 1440,
      height: 60,
      zIndex: 5,
      content: `— ${ai.title}`,
      style: {
        fontSize: 28,
        fontFamily: theme.fontBody,
        color: theme.accent,
        textAlign: 'left',
      },
    },
  ];
}

function closingLayout(ai: AIGeneratedSlide, theme: Theme): SlideElement[] {
  return [
    {
      id: uid(),
      type: 'heading',
      x: 120,
      y: 420,
      width: 1680,
      height: 200,
      zIndex: 5,
      content: ai.title,
      style: {
        fontSize: 128,
        fontFamily: theme.fontHeading,
        fontWeight: 800,
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 1.1,
      },
    },
    {
      id: uid(),
      type: 'text',
      x: 120,
      y: 660,
      width: 1680,
      height: 80,
      zIndex: 5,
      content: ai.bullets[0] ?? '',
      style: {
        fontSize: 36,
        fontFamily: theme.fontBody,
        color: theme.accent,
        textAlign: 'center',
      },
    },
    {
      id: uid(),
      type: 'shape',
      shapeType: 'rectangle',
      x: 860,
      y: 800,
      width: 200,
      height: 6,
      zIndex: 5,
      content: '',
      style: { backgroundColor: theme.primary, borderRadius: 3 },
    },
  ];
}
