// layout.tsx — Root layout wraps every page in the app
// Tailwind's base font + a simple centered shell

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Company Brain",
  description: "Your company's AI knowledge base",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-white font-sans antialiased">
        {/* Top nav */}
        <header className="border-b border-gray-800 px-6 py-4">
          <span className="text-lg font-bold tracking-tight">🧠 Company Brain</span>
        </header>

        {/* Page content */}
        <main className="max-w-4xl mx-auto px-6 py-12">{children}</main>
      </body>
    </html>
  );
}
