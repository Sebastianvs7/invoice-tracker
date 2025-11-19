"use client";

import { LanguageToggle } from "./language-toggle";
import { ThemeToggle } from "./theme-toggle";
import { useTranslations } from "@/hooks/use-translations";

export default function Header() {
  const t = useTranslations();
  return (
    <header className="border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-lg z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{t.title}</h1>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
