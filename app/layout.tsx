import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import Providers from "./providers";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ledgeros.takshil.in"),

  title: {
    default: "LedgerOS - Expense, Subscription & Budget Tracker",
    template: "%s | LedgerOS",
  },

  description:
    "LedgerOS is a modern expense tracker, subscription tracker, budget planner, and personal finance dashboard built to help you manage spending, renewals, budgets, and financial insights.",

  keywords: [
    "LedgerOS",
    "ledgeros",
    "Ledger OS",
    "expense tracker",
    "subscription tracker",
    "budget tracker",
    "personal finance dashboard",
    "spending tracker",
    "recurring expense tracker",
    "finance app",
    "money management app",
  ],

  authors: [{ name: "Takshil Pandya" }],
  creator: "Takshil Pandya",

  applicationName: "LedgerOS",

  openGraph: {
    title: "LedgerOS - Expense, Subscription & Budget Tracker",
    description:
      "Track expenses, subscriptions, budgets, recurring payments, no-spend streaks, and financial insights with LedgerOS.",
    url: "https://ledgeros.takshil.in",
    siteName: "LedgerOS",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LedgerOS Dashboard",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "LedgerOS - Expense, Subscription & Budget Tracker",
    description:
      "A modern personal finance dashboard for expenses, subscriptions, budgets, and insights.",
    images: ["/og-image.png"],
  },

  alternates: {
    canonical: "https://ledgeros.takshil.in",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="min-h-screen overflow-x-hidden bg-background font-sans text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}