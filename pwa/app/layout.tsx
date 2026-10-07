import './globals.css';
import type { Metadata, Viewport } from 'next';
import AppShell from '../components/AppShell';
import SeoStructuredData from '../components/SeoStructuredData';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://edunaija.org';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'EduNaija OS — Nigeria’s Sovereign Education Operating System',
    template: '%s | EduNaija OS',
  },
  description: "Nigeria's universal sovereign education platform: unlimited CBT mock exams (JAMB, WAEC, BECE), school syllabus decomposition, Socratic homework solver, TRCN-vetted live classrooms, and 0-data offline vault.",
  keywords: [
    'EduNaija',
    'EduNaija OS',
    'JAMB CBT Practice',
    'JAMB 2026 Cutoff Marks',
    'WAEC SSCE Past Questions',
    'NERDC Curriculum Syllabus',
    'Socratic Homework Solver Nigeria',
    'TRCN Vetted Teachers',
    'Online Tutors Nigeria',
    'Zero Data Education Nigeria',
    'NUC CCMAS 100L Courses',
    'BECE Past Questions',
  ],
  authors: [{ name: 'EduNaija Sovereign Engineering', url: baseUrl }],
  creator: 'EduNaija OS Infrastructure',
  publisher: 'EduNaija OS',
  alternates: {
    canonical: '/',
    languages: {
      'en-NG': '/',
      'yo-NG': '/indigenous-voices?lang=yoruba',
      'ig-NG': '/indigenous-voices?lang=igbo',
      'ha-NG': '/indigenous-voices?lang=hausa',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: baseUrl,
    siteName: 'EduNaija OS',
    title: 'EduNaija OS — Sovereign Education Operating System for Nigeria',
    description: 'National CBT simulator, Socratic AI homework solver, TRCN-vetted live teaching, and 0-data offline mesh vault.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'EduNaija OS - Nigeria Universal Education Operating System',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EduNaija OS — Nigeria’s Sovereign Education Operating System',
    description: 'National CBT simulator, Socratic AI homework solver, TRCN-vetted live teaching, and 0-data offline mesh vault.',
    images: ['/og-image.png'],
    creator: '@EduNaijaOS',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'EduNaija OS',
  },
};

export const viewport: Viewport = {
  themeColor: '#050508',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <SeoStructuredData />
      </head>
      <body className="font-sans aurora-bg text-white min-h-screen selection:bg-naija-green selection:text-white antialiased overflow-x-hidden">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}