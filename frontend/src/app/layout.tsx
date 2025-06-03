import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/components/Providers";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import { get } from "@vercel/edge-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZeroDeploy",
  description: "Because Every Deploy Starts at Zero.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDisabled = await get("disabled");

  if (isDisabled) {
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
        <Analytics />
      </body>
    </html>
  );
}
