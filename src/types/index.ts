// Core domain types - Gamma-style presentation app

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'team';
  brandKit?: BrandKit;
  createdAt: Date;
  exportsThisMonth: number;
}

export interface BrandKit {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontHeading?: string;
  fontBody?: string;
}

export type SlideLayout =
  | 'title'
  | 'content'
  | 'two-column'
  | 'stats'
  | 'quote'
  | 'image'
  | 'closing';

export type ElementType =
  | 'text'
  | 'heading'
  | 'subheading'
  | 'bullet'
  | 'image'
  | 'shape'
  | 'icon'
  | 'chart'
  | 'divider';

export interface ElementStyle {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number | string;
  fontStyle?: 'normal' | 'italic';
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  padding?: number;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: number;
  opacity?: number;
  shadow?: string;
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  labels: string[];
  values: number[];
  colors?: string[];
}

export interface SlideElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex: number;
  content: string;
  style: ElementStyle;
  iconName?: string;
  shapeType?: 'rectangle' | 'circle' | 'line' | 'triangle';
  chartData?: ChartData;
}

export interface Slide {
  id: string;
  title: string;
  layout: SlideLayout;
  background: string;
  elements: SlideElement[];
  notes?: string;
}

export interface CanvasSettings {
  width: number;
  height: number;
  backgroundColor: string;
  aspectRatio: '16:9' | '4:3' | '1:1' | '9:16';
}

export interface Theme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  fontHeading: string;
  fontBody: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  subtitle?: string;
  slides: Slide[];
  canvasSettings: CanvasSettings;
  theme: Theme;
  createdAt: Date;
  updatedAt: Date;
  thumbnail?: string;
  isPublic: boolean;
  publicSlug?: string;
}

export interface AIGeneratedSlide {
  title: string;
  bullets: string[];
  layout: SlideLayout;
  notes?: string;
}

export interface AIGeneratedPresentation {
  title: string;
  subtitle: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  slides: AIGeneratedSlide[];
}

export const DEFAULT_THEME: Theme = {
  primary: '#7C3AED',
  secondary: '#EC4899',
  accent: '#06B6D4',
  background: '#0F0F11',
  fontHeading: 'Space Grotesk',
  fontBody: 'Inter',
};

export const DEFAULT_CANVAS: CanvasSettings = {
  width: 1920,
  height: 1080,
  backgroundColor: '#0F0F11',
  aspectRatio: '16:9',
};
