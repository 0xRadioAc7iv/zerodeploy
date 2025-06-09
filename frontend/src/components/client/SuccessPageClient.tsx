"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SuccessPageClient() {
  const searchParams = useSearchParams();

  const projectName = searchParams.get("project_name");
  const deployedUrl = searchParams.get("deployed_url");
  const screenshotUrl = searchParams.get("ss_url");

  return (
    <div className="flex flex-col items-center w-full mx-auto">
      <Card className="bg-black/80 border-gray-700 border-2 mt-20 w-full max-w-2xl h-max shadow-md">
        <CardContent className="flex flex-col px-6">
          <div className="flex flex-col gap-3">
            <div className="text-2xl text-white font-bold">
              Congratulations!
            </div>
            <div className="text-sm text-gray-300">
              You just deployed a new project{" "}
              <span className="font-bold">{projectName}</span>
            </div>
          </div>
          <div className="py-6 rounded-[3px] overflow-hidden">
            <Link href={deployedUrl!} target="_blank">
              <Image
                src={screenshotUrl!}
                height="500"
                width="1000"
                alt="Website Screenshot"
                className="rounded-[3px]"
              />
            </Link>
          </div>
          <Button variant="secondary" className="cursor-pointer" asChild>
            <Link href={`/dashboard/${projectName}`}>
              Continue to Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
