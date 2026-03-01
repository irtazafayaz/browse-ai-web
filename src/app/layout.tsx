import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";

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
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
