import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Zameen — India's Premier Real Estate Marketplace",
    template: "%s — Zameen",
  },
  description:
    "Buy, sell, rent properties, land, and businesses across India. Find apartments, houses, villas, commercial spaces, PG accommodations, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-body">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
