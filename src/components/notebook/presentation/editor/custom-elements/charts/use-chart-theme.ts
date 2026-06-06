"use client";

import { usePresentationTheme } from "@/components/presentation/providers/PresentationThemeProvider";
import { useMemo } from "react";

/**
 * Professional color palettes — theme-aware
 * Each palette: 8 distinct, accessible, harmonious colors
 */
const COLOR_PALETTES: Record<string, string[]> = {
  // Cool professional blues / teals
  default: ["#2563eb","#0891b2","#7c3aed","#059669","#dc2626","#d97706","#db2777","#0284c7"],
  // Warm vibrant palette
  warm: ["#ea580c","#d97706","#dc2626","#db2777","#7c3aed","#2563eb","#059669","#0891b2"],
  // Monochromatic blue (for dark themes)
  mono_blue: ["#1e40af","#2563eb","#3b82f6","#60a5fa","#93c5fd","#bfdbfe","#1d4ed8","#1e3a8a"],
  // Pastel (light modern)
  pastel: ["#6366f1","#8b5cf6","#ec4899","#14b8a6","#f59e0b","#10b981","#3b82f6","#f97316"],
  // High contrast dark
  contrast: ["#60a5fa","#34d399","#f87171","#fbbf24","#a78bfa","#fb923c","#38bdf8","#4ade80"],
};

// Map presentation themes to color palettes
const THEME_PALETTE_MAP: Record<string, string> = {
  // Dark themes → contrast palette
  noir: "contrast", ebony: "contrast", phantom: "contrast",
  midnight: "contrast", abyss: "contrast", cosmos: "contrast",
  obsidian: "contrast", velvet: "contrast", magma: "contrast",
  tahlilaiDark: "contrast",
  // Cool/blue themes → default
  cornflower: "default", indigo: "default", orbit: "default",
  ocean: "default", arctic: "default", glacier: "default",
  tahlilaiLight: "default",
  // Warm themes → warm
  ember: "warm", sunset: "warm", dusk: "warm", crimson: "warm",
  amber: "warm", coral: "warm", honey: "warm", rose: "warm", wine: "warm",
  // Light/soft themes → pastel
  mint: "pastel", jade: "pastel", lavender: "pastel", sakura: "pastel",
  forest: "pastel", canopy: "pastel", aurora: "pastel", borealis: "pastel",
  sand: "pastel",
  // Default fallback
  daktilo: "default", piano: "default", mystique: "default",
};

export const CHART_COLORS = COLOR_PALETTES.default!;

export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length] ?? CHART_COLORS[0]!;
}

export interface ChartThemeConfig {
  theme: "ag-default" | "ag-default-dark";
  colors: string[];
  primaryColor: string;
  isDark: boolean;
  /** Axis/grid line color */
  axisColor: string;
  /** Background for chart container */
  chartBg: string;
  /** Text color for labels */
  labelColor: string;
}

/**
 * Returns full theme-aware chart configuration tied to the active presentation theme
 */
export function useChartTheme(): ChartThemeConfig {
  const { resolvedTheme, theme: themeName } = usePresentationTheme();

  return useMemo(() => {
    const isDark = resolvedTheme === "dark";
    const paletteName = THEME_PALETTE_MAP[themeName ?? ""] ?? (isDark ? "contrast" : "default");
    const colors = COLOR_PALETTES[paletteName] ?? COLOR_PALETTES.default!;

    return {
      theme: isDark ? "ag-default-dark" : "ag-default",
      colors,
      primaryColor: colors[0]!,
      isDark,
      axisColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)",
      chartBg: "transparent",
      labelColor: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.65)",
    };
  }, [resolvedTheme, themeName]);
}
