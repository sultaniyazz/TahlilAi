import uz from "./uz.json";

export type TranslationKeys = keyof typeof uz;

const translations = {
  uz,
} as const;

export type Language = keyof typeof translations;

/**
 * Get a translation value by key path
 * @example
 * t("presentation.title") // returns "Taqdimot"
 * t("common.loading") // returns "Yuklanmoqda..."
 */
export function t(key: string, lang: Language = "uz"): string {
  const keys = key.split(".");
  let value: any = translations[lang];

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key; // Return the key itself as fallback
    }
  }

  return typeof value === "string" ? value : key;
}

/**
 * Get all translations for a specific section
 * @example
 * const commonTranslations = tSection("common")
 * commonTranslations.loading // returns "Yuklanmoqda..."
 */
export function tSection<K extends TranslationKeys>(
  section: K,
  lang: Language = "uz",
): Record<string, string> {
  const sectionData = translations[lang][section];
  if (typeof sectionData !== "object") {
    return {};
  }
  return sectionData as Record<string, string>;
}

// Export translations directly for cases where you need the raw object
export const translationsData = translations;

export default translations.uz;
