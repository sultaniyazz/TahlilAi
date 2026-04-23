// Core Types for AI Presentation Generator

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

export interface Project {
  id: string;
  userId: string;
  title: string;
  subtitle?: string;
  pages: Page[];
  canvasSettings: CanvasSettings;
  createdAt: Date;
  updatedAt: Date;
  thumbnail?: string;
  isPublic: boolean;
  publicSlug?: string;
  history: EditHistory[];
}

export interface Page {
  id: string;
  heading: string;
  content: string;
  elements: InfographicElement[];
}

export interface CanvasSettings {
  width: number;
  height: number;
  backgroundColor: string;
  backgroundGradient?: GradientSettings;
  aspectRatio: '1:1' | '9:16' | '16:9' | '4:5';
}

export interface GradientSettings {
  type: 'linear' | 'radial';
  colors: string[];
  angle?: number;
}

export interface InfographicElement {
  id: string;
  type: 'text' | 'heading' | 'stat' | 'chart' | 'icon' | 'image' | 'shape' | 'divider';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  style: ElementStyle;
  data?: ChartData | StatData;
  iconName?: string;
  zIndex: number;
}

export interface ElementStyle {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
  textAlign?: 'left' | 'center' | 'right';
  opacity?: number;
  lineHeight?: number;
  border?: string;
  height?: number | string;
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  labels: string[];
  values: number[];
  colors?: string[];
}

export interface StatData {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export interface CanvasSettings {
  width: number;
  height: number;
  backgroundColor: string;
  backgroundGradient?: GradientSettings;
  aspectRatio: '1:1' | '9:16' | '16:9' | '4:5';
}

export interface GradientSettings {
  type: 'linear' | 'radial';
  colors: string[];
  angle?: number;
}

export type LayoutType = 'timeline' | 'comparison' | 'list' | 'stats' | 'process' | 'hierarchy';

export interface InfographicElement {
  id: string;
  type: 'text' | 'heading' | 'stat' | 'chart' | 'icon' | 'image' | 'shape' | 'divider';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  style: ElementStyle;
  data?: ChartData | StatData;
  iconName?: string;
  zIndex: number;
}

export interface ElementStyle {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
  textAlign?: 'left' | 'center' | 'right';
  opacity?: number;
  lineHeight?: number;
  border?: string;
  height?: number | string;
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  labels: string[];
  values: number[];
  colors?: string[];
}

export interface StatData {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export interface EditHistory {
  id: string;
  timestamp: Date;
  action: string;
  pages: Page[];
}

export interface PresentationData {
  title: string;
  pages: {
    heading: string;
    content: string;
  }[];
}

export interface AIAnalysisResult {
  detectedLayout: string;
  confidence: number;
  title: string;
  subtitle?: string;
  statistics: DetectedStatistic[];
  dates: DetectedDate[];
  comparisons: DetectedComparison[];
  topics: string[];
  suggestedIcons: string[];
  suggestedColors: string[];
}

export interface DetectedStatistic {
  value: number;
  originalText: string;
  context: string;
  unit?: string;
}

export interface DetectedDate {
  date: Date;
  originalText: string;
  event?: string;
}

export interface DetectedComparison {
  itemA: string;
  itemB: string;
  contrastPoint: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  layout: LayoutType;
  thumbnail: string;
  elements: InfographicElement[];
  canvasSettings: CanvasSettings;
  isPremium: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  limits: {
    exportsPerMonth: number;
    projects: number;
    teamMembers?: number;
    storageGB: number;
  };
  isPopular?: boolean;
}

export interface ExportOptions {
  format: 'png' | 'pdf' | 'svg';
  dpi: number;
  quality: number;
  includeBleed?: boolean;
}

// Visual Hierarchy Types
export interface VisualHierarchy {
  level: 1 | 2 | 3 | 4 | 5;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  lineHeight: number;
  marginBottom: number;
  color: string;
}

// Animation Types
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  stagger?: number;
}
