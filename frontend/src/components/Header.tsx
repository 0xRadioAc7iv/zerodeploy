"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full sticky top-0 bg-black border-b backdrop-blur-md border-white/10 shadow-sm z-50">
      <div className="flex items-center justify-between py-4 px-6 md:px-10 mx-auto">
        <div className="flex items-center space-x-14">
          <Link href="/" className="flex items-stretch gap-2">
            <Image
              src="/logos/main_logo_white.svg"
              alt="ZeroDeploy"
              width={25}
              height={25}
              className="align-middle"
            />
            <span className="text-2xl text-white font-bold leading-none tracking-tight">
              ZeroDeploy
            </span>
          </Link>

          {/* <nav className="hidden md:flex items-center space-x-8 text-sm text-gray-500">
            <Link
              href="/templates"
              className="hover:text-black transition-colors font-medium"
            >
              Templates
            </Link>
            <Link
              href="/features"
              className="hover:text-black transition-colors font-medium"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="hover:text-black transition-colors font-medium"
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="hover:text-black transition-colors font-medium"
            >
              Documentation
            </Link>
          </nav> */}
        </div>

        <div className="hidden md:flex items-center space-x-3">
          <Button className="bg-gray-800" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/contact">Contact</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
