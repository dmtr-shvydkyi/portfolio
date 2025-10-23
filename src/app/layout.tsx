import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://shvydkyi.me'),
  title: "Dmytro Shvydkyi",
  description: "Product Designer based in Kyiv, Ukraine",
  icons: {
    icon: [
      { url: '/favicon/favicon.ico' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: '/favicon/apple-touch-icon.png',
    other: [
      { rel: 'icon', type: 'image/svg+xml', url: '/favicon/favicon.svg' },
    ],
  },
  manifest: '/favicon/site.webmanifest',
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
