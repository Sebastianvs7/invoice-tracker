import en from "./dictionaries/en.json";
import cs from "./dictionaries/cs.json";
import { Locale, defaultLocale } from "./config";

export const translations = {
  en,
  cs,
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = typeof translations.en;

export function getTranslations(locale: Locale) {
  const result = translations[locale];
  if (!result) {
    console.warn(
      `Translations not found for locale: ${locale}, falling back to ${defaultLocale}`
    );
    return translations[defaultLocale];
  }
  return result;
}

// Re-export config
export { locales, defaultLocale, localeNames, type Locale } from "./config";

