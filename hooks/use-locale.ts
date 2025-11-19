"use client";

import { useParams } from "next/navigation";
import { defaultLocale, type Locale } from "@/i18n";

export function useLocale(): Locale {
  const params = useParams();
  return (params?.locale as Locale) || defaultLocale;
}
