import type { Metadata } from "next";
<<<<<<< HEAD
import { Manrope, Outfit } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
=======
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
>>>>>>> 3550e4025e2ea1d825a4f61847e1207ce320f2cc
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PersonaAI — Identity-First Content Engine",
  description: "Modernizing your persona and content generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
<<<<<<< HEAD
      className={`${manrope.variable} ${outfit.variable} h-full antialiased`}
=======
      className={`${inter.variable} ${plusJakarta.variable} h-full antialiased`}
>>>>>>> 3550e4025e2ea1d825a4f61847e1207ce320f2cc
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
