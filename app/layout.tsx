import type { Metadata } from "next";
import "./globals.css";

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
      <body className="min-h-screen bg-cream-50">{children}</body>
    </html>
  );
}
