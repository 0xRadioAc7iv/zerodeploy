import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t mt-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-20 py-10 grid grid-cols-1 md:grid-cols-4 gap-40 text-sm text-gray-600">
        <div>
          <h3 className="font-bold text-xl text-gray-800 mb-3">ZeroDeploy</h3>
          <p className="text-gray-500 font-semibold w-52">
            Deploy your projects in seconds. Zero config. Zero friction.
          </p>
        </div>

        <div>
          <h4 className="font-medium text-gray-800 mb-3">Product</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/features" className="hover:underline">
                Features
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:underline">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/docs" className="hover:underline">
                Documentation
              </Link>
            </li>
            <li>
              <Link href="/templates" className="hover:underline">
                Templates
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-gray-800 mb-3">Company</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/about" className="hover:underline">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:underline">
                Blog
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-gray-800 mb-3">Legal</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/terms" className="hover:underline">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:underline">
                Privacy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t text-center text-xs text-gray-400 py-6">
        © {new Date().getFullYear()} ZeroDeploy. All rights reserved.
      </div>
    </footer>
  );
}
