"use client";

import { useParams } from "next/navigation";
import { getTranslations, defaultLocale, type Locale } from "@/i18n";

export function useTranslations() {
  const params = useParams();
  const locale = (params?.locale as Locale) || defaultLocale;
  const translations = getTranslations(locale);

  // Safety check - return default locale translations if undefined
  if (!translations) {
    return getTranslations(defaultLocale);
  }

  return translations;
}
