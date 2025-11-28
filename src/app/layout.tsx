import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'; // Add Clerk
import { Toaster } from "sonner"; // <--- Import this

export const metadata: Metadata = {
  title: "AI UI Generator",
  description: "Generate UI from text prompts",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider> {/* Wrap app in Auth */}
      <html lang="en" suppressHydrationWarning>
        <body className="theme-lovable token-page">
          {children}
          <Toaster position="bottom-center" /> {/* <--- Add this line */}
        </body>
      </html>
    </ClerkProvider>
  );
}