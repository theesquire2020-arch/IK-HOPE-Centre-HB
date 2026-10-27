import type { Metadata } from "next";
import { Fraunces, Public_Sans } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StickyDonate } from "@/components/sticky-donate";
import { CurrencyBootstrap } from "@/components/currency";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});
const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  title: {
    default: "IK Hope Centre Orphanage — Every child deserves hope",
    template: "%s · IK Hope Centre",
  },
  description:
    "IK Hope Centre is a registered Kenyan orphanage caring for 128 children in Nairobi. Donate via M-PESA, Airtel Money or bank transfer, or start a fundraiser for the children in our care.",
  keywords: [
    "orphanage Kenya",
    "donate Kenya",
    "M-PESA donation",
    "Airtel Money donation",
    "child welfare",
    "fundraiser",
  ],
  openGraph: {
    title: "IK Hope Centre Orphanage — Every child deserves hope",
    description:
      "A registered Kenyan orphanage caring for 128 children. Give via M-PESA, Airtel Money or bank transfer — or start your own fundraiser.",
    type: "website",
    locale: "en_KE",
    siteName: "IK Hope Centre",
    images: [{ url: "/images/hero.jpg", width: 1200, height: 630, alt: "Children of IK Hope Centre walking to school" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "IK Hope Centre Orphanage — Every child deserves hope",
    description:
      "A registered Kenyan orphanage caring for 128 children. Give via M-PESA, Airtel Money or bank transfer.",
    images: ["/images/hero.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${publicSans.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-forest-900 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-cream-50"
        >
          Skip to content
        </a>
        <CurrencyBootstrap />
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <StickyDonate />
      </body>
    </html>
  );
}
