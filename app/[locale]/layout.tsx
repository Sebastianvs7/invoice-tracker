import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { locales, defaultLocale, type Locale } from "@/i18n";
import "@/styles/globals.css";

const geist = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Invoice Tracker",
  description: "Track carrier invoices and shipments",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const resolvedLocale = locale || defaultLocale;

  return (
    <html lang={resolvedLocale}>
      <body className={`${geist.className} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
