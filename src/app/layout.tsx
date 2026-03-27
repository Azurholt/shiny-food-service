// src/app/layout.tsx
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Manrope } from 'next/font/google';
import "./globals.css";

// Font configurations
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

// Metadata (must be BEFORE default export)
export const metadata: Metadata = {
  title: "Kueue",
  description: "Making food ordering simple for Kumasi's busy markets",
};

// ONE default export only
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${manrope.variable}`}>
      <body className="font-body antialiased">
        {children}
      </body>
    </html>
  );
}