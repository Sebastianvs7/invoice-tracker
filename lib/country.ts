/**
 * Country-related utilities
 */

/**
 * Get country flag emoji from ISO country code
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., "CZ", "US", "GB")
 * @returns Country flag emoji or 🌍 as fallback
 */
export function getCountryFlag(countryCode: string): string {
  if (!countryCode) return "🌍";
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🌍";
  }
}
