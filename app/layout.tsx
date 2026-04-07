import type { Metadata } from "next";
import { Libre_Baskerville, DM_Sans } from "next/font/google";
import "./globals.css";

const baskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Throughline — Green Card Document Reviewer",
  description:
    "Upload your immigration documents and get an AI analysis of what's complete, what's missing, and what might get flagged by USCIS.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${baskerville.variable} ${dmSans.variable} min-h-screen bg-cream-50`}>
        {children}
      </body>
    </html>
  );
}
