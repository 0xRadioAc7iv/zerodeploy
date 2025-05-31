"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useTypewriter, Cursor } from "react-simple-typewriter";

export default function Home() {
  const { status } = useSession();

  if (status === "authenticated") {
    redirect("/new");
  }

  const [text] = useTypewriter({
    words: [
      "Zero to Deploy in One Click.",
      "Zero Waiting. Infinite Deploys.",
      "Deploy from Zero to Hero.",
      "Because Every Deploy Starts at Zero.",
      "Zero Hassle, Maximum Deploy.",
    ],
    loop: true,
    delaySpeed: 2500,
    deleteSpeed: 50,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-col flex-grow gap-12 items-center justify-center px-4">
        <div className="text-5xl font-semibold text-center">
          {text}
          <Cursor cursorStyle="|" />
        </div>
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
      </div>
    </div>
  );
}
