import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/src/components/NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Safety Diver",
  description: "Knowledge Clarity = Water Clarity — AI Knowledge Governance",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-deep text-foam antialiased`}>
        <NavBar />
        <main className="max-w-6xl mx-auto px-6 py-12">
          {children}
        </main>
      </body>
    </html>
  );
}
