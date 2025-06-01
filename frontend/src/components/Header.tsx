import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full border-b shadow-sm">
      <div className="flex items-center justify-between py-4 px-12">
        <div className="flex items-center space-x-14">
          <Link href="/" className="flex items-stretch gap-2">
            <Image
              src="/logos/main_logo_black.svg"
              alt="Not Vercel"
              width={25}
              height={25}
              className="align-middle"
            />
            <span className="text-2xl font-semibold leading-none">
              ZeroDeploy
            </span>
          </Link>

          {/* <nav className="hidden md:flex items-center space-x-6 text-base text-gray-700">
            <Link
              href="/templates"
              className="hover:text-black transition-colors"
            >
              Templates
            </Link>
            <Link
              href="/pricing"
              className="hover:text-black transition-colors"
            >
              Pricing
            </Link>
          </nav> */}
        </div>

        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">Contact</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
