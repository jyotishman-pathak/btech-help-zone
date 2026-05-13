import { Inter } from "next/font/google";
import "./globals.css";

import { Providers } from "./providers";

import type { Metadata, Viewport } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "CEE HelpZone", template: "%s | CEE HelpZone" },
  description:
    "Assam CEE preparation platform — mock tests, previous year questions, analytics, and leaderboards.",
  keywords: [
    "Assam CEE",
    "CEE mock test",
    "CEE preparation",
    "JEC",
    "AEC",
    "physics chemistry maths",
  ],
  authors: [{ name: "CEE HelpZone" }],
  creator: "CEE HelpZone",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "CEE HelpZone",
    title: "CEE HelpZone — Crack Assam CEE",
    description: "India's best Assam CEE preparation platform.",
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-white antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
