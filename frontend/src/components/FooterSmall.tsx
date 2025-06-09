import Link from "next/link";
import Image from "next/image";

export default function FooterSmall() {
  return (
    <footer className="w-full border-t border-white/10 bg-black text-sm text-gray-400 px-6 md:px-16 py-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Image
            src="/logos/main_logo_white.svg"
            alt="Logo"
            width={16}
            height={16}
          />
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          <Link href="/docs" className="hover:text-white">
            Docs
          </Link>
          <Link href="/contact" className="hover:text-white">
            Contact
          </Link>
        </div>
      </div>

      <div className="text-xs text-gray-500 mt-4">
        © {new Date().getFullYear()}, ZeroDeploy Inc.
      </div>
    </footer>
  );
}
