import Header from "@/components/Header";
import LandingTyping from "@/components/LandingTyping";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
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
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-col flex-grow gap-12 items-center justify-center px-4">
        <LandingTyping />
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
