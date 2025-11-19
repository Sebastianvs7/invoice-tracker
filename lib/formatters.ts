/**
 * Formatting utilities for dates, currency, and weights
 */

/**
 * Format a date string according to the specified locale
 */
export function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  const localeMap: Record<string, string> = {
    en: "en-US",
    cs: "cs-CZ",
  };
  return date.toLocaleDateString(localeMap[locale] || locale, {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date string with time according to the specified locale
 */
export function formatDateTime(dateString: string, locale: string): string {
  const date = new Date(dateString);
  const localeMap: Record<string, string> = {
    en: "en-US",
    cs: "cs-CZ",
  };
  return date.toLocaleDateString(localeMap[locale] || locale, {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a number as currency (Czech Koruna)
 */
export function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} Kč`;
}

/**
 * Format a number as weight (kilograms)
 */
export function formatWeight(amount: number): string {
  return `${amount.toFixed(2)} kg`;
}
