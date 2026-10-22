import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aaroh — Personal Career Intelligence Platform",
  description: "Know yourself. Explore your paths. Prove your potential. An intelligent, student-first career development platform.",
  keywords: ["career exploration", "skill intelligence", "career trials", "adaptive roadmap", "student portfolio"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${manrope.variable} font-sans antialiased selection:bg-brand-primary/25 selection:text-brand-primary`}>
        {children}
      </body>
    </html>
  );
}
