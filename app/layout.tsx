import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI UI Generator",
  description: "Generate UI from text prompts + Community Prompt Hub",
};

// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="theme-lovable token-page">
        {children}
      </body>
    </html>
  );
}
