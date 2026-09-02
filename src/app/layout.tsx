import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Copahome — AI Curtain Visualizer",
  description:
    "Zie hoe jouw interieur eruitziet met Copahome. Upload een foto van je ruimte en visualiseer transparante, semi-transparante of blackout gordijnen in jouw eigen interieur.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="nl" className={`${jost.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">{children}</body>
    </html>
  );
}
