import { AppSidebar } from "@/components/app-sidebar";
import GoogleAnalytics from "@/components/google-analytics";
import { MainHeader } from "@/components/main-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import type React from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "FreeTools - Free Online Tools",
    template: "FreeTools | %s",
  },
  description:
    "Free online tools for developers and everyone. QR codes, text comparison, password generation and more.",
  keywords: [
    "free tools",
    "online tools",
    "developer tools",
    "FreeTools",
    "qr generator",
    "password generator",
    "text compare",
  ],
  authors: [{ name: "FreeTools" }],
  creator: "FreeTools",
  publisher: "FreeTools",
  metadataBase: new URL("https://freetools.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://freetools.com",
    title: "FreeTools - Free Online Tools",
    description:
      "Free online tools for developers and everyone. QR codes, text comparison, password generation and more.",
    siteName: "FreeTools",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "FreeTools - Free Online Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FreeTools - Free Online Tools",
    description:
      "Free online tools for developers and everyone. QR codes, text comparison, password generation and more.",
    creator: "@freetools",
    images: ["/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-verification-code",
    yandex: "yandex-verification-code",
    yahoo: "yahoo-verification-code",
  },
  category: "Technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          href="/favicon-16x16.png"
          sizes="16x16"
          type="image/png"
        />
        <link
          rel="icon"
          href="/favicon-32x32.png"
          sizes="32x32"
          type="image/png"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="msapplication-TileColor" content="#7c3aed" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={inter.className + " bg-gray-50 overflow-hidden"}>
        <GoogleAnalytics />
        <SidebarProvider>
          <div className="h-screen flex flex-col w-full">
            {/* Header - Fixed at top, full viewport width */}
            <div className="flex-shrink-0 sticky top-0 z-50 bg-white w-screen">
              <MainHeader />
            </div>

            {/* Logo positioned over sidebar area on desktop */}
            <Link
              href="/all"
              className="hidden md:flex fixed top-4 left-4 z-[60] items-center gap-2 select-none group transition-all duration-200"
            >
              <div className="flex items-center">
                <span className="font-bold text-lg text-gray-900">Free</span>
                <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Tools
                </span>
                <span className="ml-1 origin-center">🛠️</span>
              </div>
            </Link>

            {/* Main layout with sidebar - fills remaining height and full width */}
            <div className="flex flex-1 min-h-0 w-screen">
              <AppSidebar />
              <div className="flex-1 flex flex-col min-h-0 min-w-0">
                <main className="flex-1  overflow-auto w-full">{children}</main>
              </div>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
