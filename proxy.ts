import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "./i18n";

function getLocale(request: NextRequest): string {
  // Check if there is any supported locale in the pathname
  const { pathname } = request.nextUrl;

  // Check if pathname starts with a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    // Extract locale from pathname
    const locale = pathname.split("/")[1];
    if (locales.includes(locale as any)) {
      return locale;
    }
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    for (const locale of locales) {
      if (acceptLanguage.includes(locale)) {
        return locale;
      }
    }
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Don't redirect API routes, static files, or Next.js internals
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // Check if pathname is missing locale
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    const newPath = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    "/((?!_next|api|favicon.ico|.*\\..*).*)",
  ],
};
