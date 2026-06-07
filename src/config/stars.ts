export const STAR_COSTS = {
  PRESENTATION_BASIC: 10,
  PRESENTATION_DETAILED: 15,
  PRESENTATION_LARGE: 20,
} as const;

export const INITIAL_STARS = 100;

export type TextContentLevel =
  | "minimal"
  | "concise"
  | "detailed"
  | "extensive"
  | "ixcham"
  | "batafsil"
  | "kengaytirilgan";

function normalizeTextContent(
  textContent: TextContentLevel,
): "minimal" | "concise" | "detailed" | "extensive" {
  switch (textContent) {
    case "ixcham":
      return "concise";
    case "batafsil":
      return "detailed";
    case "kengaytirilgan":
      return "extensive";
    default:
      return textContent;
  }
}

export function calculateStarCost(opts: {
  slides: number;
  textContent: TextContentLevel;
}): number {
  const textContent = normalizeTextContent(opts.textContent);

  if (opts.slides > 15 || textContent === "extensive") {
    return STAR_COSTS.PRESENTATION_LARGE;
  }
  if (opts.slides > 10 || textContent === "detailed") {
    return STAR_COSTS.PRESENTATION_DETAILED;
  }
  return STAR_COSTS.PRESENTATION_BASIC;
}
