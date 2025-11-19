"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale } from "@/hooks/use-locale";
import { usePathname, useRouter } from "next/navigation";
import { locales, localeNames, type Locale } from "@/i18n";
import { useTranslations } from "@/hooks/use-translations";

export function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations();

  const switchLocale = (newLocale: Locale) => {
    // Remove current locale from pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";
    // Navigate to new locale
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="border-border/50">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t.changeLanguage}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchLocale(loc)}
            className={locale === loc ? "bg-accent" : ""}
          >
            <span className="mr-2">{loc === "en" ? "🇬🇧" : "🇨🇿"}</span>
            {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
