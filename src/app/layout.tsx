import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://shvydkyi.me'),
  title: "Dmytro Shvydkyi",
  description: "Product Designer based in Kyiv, Ukraine",
  // Let App Router file-based metadata handle icons placed in `src/app`:
  // - `src/app/favicon.ico`
  // - `src/app/apple-icon.png`
  // - optional: `src/app/icon.png` or `src/app/icon.svg`
  manifest: '/manifest.json',
  openGraph: {
    title: "Dmytro Shvydkyi",
    description: "Product Designer based in Kyiv, Ukraine",
    url: 'https://shvydkyi.me',
    siteName: 'Dmytro Shvydkyi',
    images: [
      {
        url: '/og.jpg',
        width: 1200,
        height: 630,
        alt: 'Dmytro Shvydkyi - Product Designer',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Dmytro Shvydkyi",
    description: "Product Designer based in Kyiv, Ukraine",
    creator: '@shvydkyi_',
    images: ['/og.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
