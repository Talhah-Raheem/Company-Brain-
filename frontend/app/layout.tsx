import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import NavBar from "@/src/components/NavBar";
import PageTransition from "@/src/components/PageTransition";
import DepthGauge from "@/src/components/DepthGauge";
import WaterBackground from "@/src/components/water/WaterBackground";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "The Safety Diver",
  description: "Knowledge Clarity = Water Clarity — AI Knowledge Governance",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-abyss text-foam antialiased font-sans">
        <WaterBackground />
        <NavBar />
        <DepthGauge />
        <main className="max-w-6xl mx-auto px-6 py-12 relative">
          <PageTransition>{children}</PageTransition>
        </main>
      </body>
    </html>
  );
}
