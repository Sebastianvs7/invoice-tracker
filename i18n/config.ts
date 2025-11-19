import type { Locale } from "@/types";

export const locales = ["en", "cs"] as const;
export const defaultLocale = "en" as const;

// Re-export Locale type for backward compatibility
export type { Locale };

export const localeNames: Record<Locale, string> = {
  en: "English",
  cs: "Čeština",
};

