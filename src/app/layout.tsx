import type { Metadata } from "next";
import { Archivo_Black, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/lib/Providers";

const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-archivo-black',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Browse AI — Shop with words, not filters",
  description: "AI-powered fashion discovery. Describe what you want in plain English and find it across 500+ brands instantly.",
  keywords: ["fashion", "AI shopping", "style discovery", "clothing", "outfit finder"],
  openGraph: {
    title: "Browse AI — Shop with words, not filters",
    description: "AI-powered fashion discovery across 500+ brands.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`antialiased ${archivoBlack.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
