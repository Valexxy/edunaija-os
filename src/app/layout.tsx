import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { OfflineStatusBanner } from "@/components/offline/offline-status-banner";
import { ZenModeFloatingSupervisor } from "@/components/layout/zen-mode-toggle";
import { AnalyticsProvider } from "@/components/providers/analytics-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PwaRegister } from "@/components/pwa/pwa-register";
import { GlobalProgressBar } from "@/components/layout/global-progress-bar";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getEducationalOrganizationSchema,
  getWebSiteSchema,
  getNationalFAQSchema
} from "@/lib/seo/structured-data";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://learnnaija.ng";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "LearnNaija OS — Nigerian-First Sovereign AI Learning Infrastructure",
    template: "%s | LearnNaija OS"
  },
  description: "Official Nigerian curriculum-aligned learning platform. Authentic JAMB UTME, WAEC WASSCE, and NECO CBT exam simulations, Socratic AI tutoring, and inter-school academic tournaments.",
  keywords: [
    "JAMB CBT practice",
    "WAEC 2026 past questions",
    "NECO SSCE prep",
    "NERDC curriculum Nigeria",
    "TRCN vetted tutors",
    "Nigerian AI tutor",
    "Sister Amaka AI",
    "Nigerian inter-school competition",
    "LearnNaija OS",
    "EduNaija"
  ],
  authors: [{ name: "LearnNaija Education Engineering" }],
  creator: "LearnNaija OS",
  publisher: "Federal Republic of Nigeria Educational Standards",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LearnNaija OS"
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: appUrl,
    title: "LearnNaija OS — Sovereign Educational Operating System",
    description: "Replicating official statutory JAMB, WAEC, and NECO exams with offline PWA support, Socratic AI mentorship, and TRCN-vetted live classrooms.",
    siteName: "LearnNaija OS",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "LearnNaija OS National Emblem"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "LearnNaija OS — Nigerian-First Sovereign AI Learning Infrastructure",
    description: "Authentic JAMB UTME & WAEC CBT simulations with offline PWA support and national merit competitions.",
    creator: "@LearnNaijaOS",
    images: ["/icons/icon-512.png"]
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-NG": "/",
      "yo-NG": "/?lang=yo",
      "ig-NG": "/?lang=ig",
      "ha-NG": "/?lang=ha"
    }
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }
};

export const viewport: Viewport = {
  themeColor: "#087F5B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const orgSchema = getEducationalOrganizationSchema();
  const siteSchema = getWebSiteSchema();
  const faqSchema = getNationalFAQSchema();

  return (
    <html lang="en-NG">
      <head>
        <JsonLd data={[orgSchema, siteSchema, faqSchema]} />
      </head>
      <body>
        <ThemeProvider>
          <AnalyticsProvider>
            <Suspense fallback={null}>
              <GlobalProgressBar />
            </Suspense>
            <SiteHeader />
            <ZenModeFloatingSupervisor />
            {children}
            <PwaRegister />
            <OfflineStatusBanner />
          </AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
