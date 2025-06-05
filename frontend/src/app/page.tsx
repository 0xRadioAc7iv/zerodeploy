import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LandingTyping from "@/components/LandingTyping";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { ChevronDown } from "lucide-react";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/new");
  }

  return (
    <div className="flex flex-col">
      <Header />
      <div className="min-h-screen flex flex-col flex-grow gap-6 items-center justify-center px-4">
        <LandingTyping />

        <p className="text-center text-gray-500 text-lg">
          Built for developers who want to ship fast — connect your repo and
          deploy in seconds.
        </p>

        <div>
          <Button variant="outline" size="lg" className="rounded-full" asChild>
            <Link href="/login" className="">
              <Image
                src="/logos/main_logo_black.svg"
                alt="Deploy"
                width={20}
                height={20}
                className=""
              />
              <span className="text-lg font-semibold">Start Deploying</span>
            </Link>
          </Button>
        </div>

        <a
          href="#demo"
          className="mt-2 flex flex-col items-center text-sm text-gray-600 hover:text-black transition-colors"
        >
          <div className="flex flex-col items-center gap-[-2px]">
            <ChevronDown
              className="animate-bounce ease-in-out delay-[0ms]"
              size={20}
            />
            <ChevronDown
              className="animate-bounce ease-in-out delay-[150ms]"
              size={20}
            />
            <ChevronDown
              className="animate-bounce ease-in-out delay-[300ms]"
              size={20}
            />
          </div>
        </a>
      </div>

      <div id="demo" className="px-4 pb-20 flex justify-center">
        <div className="w-full max-w-7xl rounded-xl overflow-hidden shadow-lg mt-6">
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

      <Footer />
    </div>
  );
}
