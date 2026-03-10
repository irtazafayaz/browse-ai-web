import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "@/lib/Providers";

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
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
      <body className={`antialiased ${playfair.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
