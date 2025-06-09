import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-black/95">
      <div className="flex justify-between px-6 md:px-28 py-10 text-sm text-gray-600">
        <div className="flex gap-8 items-center">
          <div>
            <Image
              src="logos/main_logo_white.svg"
              height="80"
              width="80"
              alt="ZeroDeploy Logo"
            />
          </div>
          <div className="flex flex-col leading-5">
            <h3 className="font-bold text-3xl tracking-tight text-white mb-3">
              ZeroDeploy
            </h3>
            <p className="text-gray-300 font-semibold w-52">
              Deploy your projects in seconds. Zero config. Zero friction.
            </p>
          </div>
        </div>

        <div className="flex gap-24">
          <div>
            <h4 className="font-semibold text-lg text-white mb-3">Product</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/docs" className="hover:underline">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg text-white mb-3">Company</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link
                  href="https://0xradioactiv.xyz"
                  target="_blank"
                  className="hover:underline"
                >
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline">
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="https://radioactiv.hashnode.dev"
                  target="_blank"
                  className="hover:underline"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 text-center text-xs text-white py-6">
        © {new Date().getFullYear()} ZeroDeploy. All rights reserved.
      </div>
    </footer>
  );
}
