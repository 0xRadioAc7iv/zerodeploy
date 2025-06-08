import Footer from "@/components/Footer";
import LandingPageHeader from "@/components/Header";
import LandingTyping from "@/components/LandingTyping";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { buildOgMetadata } from "@/lib/ogMetadata";
import Spline from "@splinetool/react-spline/next";

export const generateMetadata = () => buildOgMetadata({});

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col">
      <LandingPageHeader />
      <div className="relative min-h-screen flex flex-col flex-grow gap-6 items-center justify-center px-4 overflow-hidden">
        {/* CREDITS TO AURORA FOR THE SPLINE DESIGN (https://app.spline.design/@auroregmbt) */}
        <main className="absolute inset-0 w-full h-full pointer-events-auto z-0">
          <Spline scene="https://prod.spline.design/oDLCN117xsaioDXf/scene.splinecode" />
        </main>

        <LandingTyping />
        <p className="text-lg text-gray-200 z-1">
          Built for developers who want to ship fast — connect your repo and
          deploy in seconds.
        </p>

        <div className="flex gap-4 z-1">
          <Button
            variant="secondary"
            size="lg"
            className="rounded-full mt-4 shadow-md hover:shadow-lg transition"
            asChild
          >
            <Link href={session ? "/new" : "/login"}>
              <Image
                src="/logos/main_logo_black.svg"
                alt="Deploy"
                width={20}
                height={20}
              />
              <span className="text-lg font-semibold">Start Deploying</span>
            </Link>
          </Button>
          <Button
            size="lg"
            className="bg-gray-800 rounded-full mt-4 shadow-md hover:shadow-lg transition"
            asChild
          >
            {/* eslint-disable @next/next/no-html-link-for-pages */}
            <a href="/#demo">
              <span className="text-lg font-semibold">View Demo</span>
            </a>
          </Button>
        </div>
      </div>

      <section className="py-24 px-6 bg-black/95 text-white text-center">
        <h2 className="text-4xl font-bold mb-6">What is ZeroDeploy?</h2>
        <p className="max-w-3xl mx-auto text-lg text-gray-300 mb-16">
          ZeroDeploy is the simplest way to build and deploy frontend apps.
          Connect your GitHub repo, detect the framework, run builds in secure
          Docker containers, and host the output on a fast CDN — all without
          leaving your browser.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left text-sm">
          <div className="bg-white/10 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2">
              Instant GitHub Deploys
            </h3>
            <p className="text-gray-400">
              OAuth-based integration with repo cloning, framework detection,
              and build triggering.
            </p>
          </div>

          <div className="bg-white/10 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2">
              Live Logs & Dashboard
            </h3>
            <p className="text-gray-400">
              Monitor real-time logs while your builds run in secure Docker
              containers on EC2.
            </p>
          </div>

          <div className="bg-white/10 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2">Automatic Domains</h3>
            <p className="text-gray-400">
              Every deploy gets a unique, sharable subdomain like{" "}
              <code>myapp.zerodeploy.xyz</code>.
            </p>
          </div>

          <div className="bg-white/10 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2">Framework Detection</h3>
            <p className="text-gray-400">Supports Vite. More Coming Soon.</p>
          </div>

          <div className="bg-white/10 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2">Built on AWS</h3>
            <p className="text-gray-400">
              Fast global CDN via S3 + CloudFront. Secure, scalable, and
              cost-efficient.
            </p>
          </div>

          <div className="bg-white/10 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2">
              Developer-First CLI (soon)
            </h3>
            <p className="text-gray-400">
              Deploy directly from your terminal. GitHub webhooks & CLI triggers
              planned.
            </p>
          </div>
        </div>
      </section>

      <div
        id="demo"
        className="bg-black/95 px-4 pb-20 pt-20 flex flex-col items-center justify-center"
      >
        <div className="text-white text-4xl font-bold mb-10">
          Watch ZeroDeploy in Action
        </div>
        <div className="w-full max-w-5xl rounded-xl overflow-hidden shadow-lg">
          <video
            src="/demo/demo_video.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto"
          />
        </div>
      </div>

      <section className="bg-black/95 text-white py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Ship Your Next Project?
        </h2>
        <p className="text-gray-400 text-lg mb-8">
          Connect your GitHub repo and get your app live in less than 60
          seconds.
        </p>
        <Button
          variant="default"
          size="lg"
          className="rounded-full bg-white text-black text-base font-semibold hover:bg-gray-200 transition"
          asChild
        >
          <Link href={session ? "/new" : "/login"}>Start Deploying</Link>
        </Button>
      </section>

      <Footer />
    </div>
  );
}
