import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/components/Providers";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { get } from "@vercel/edge-config";
import { env } from "@/env";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zerodeploy.xyz"),
  title: "ZeroDeploy",
  description: "Because Every Deploy Starts at Zero.",
  openGraph: {
    title: "ZeroDeploy",
    description: "Because Every Deploy Starts at Zero.",
    url: new URL("https://zerodeploy.xyz"),
    siteName: "ZeroDeploy",
    locale: "en_US",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDisabled = await get("disabled");

  if (env.NODE_ENV === "production" && isDisabled) {
    return (
      <html lang="en">
        <body>🚧 The app is temporarily down for maintenance.</body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense>
          <SessionProviderWrapper>{children}</SessionProviderWrapper>
        </Suspense>
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  );
}
