"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export default function SuccessPageClient() {
  const searchParams = useSearchParams();

  const projectName = searchParams.get("project_name");
  const deployedUrl = searchParams.get("deployed_url");

  const [screenshot, setScreenshot] = useState<string | null>(null);

  useEffect(() => {
    const fetchSS = async () => {
      const response = await fetch("/api/screenshot", {
        method: "POST",
        body: JSON.stringify({ url: deployedUrl }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (data.screenshotBase64) {
        setScreenshot(data.screenshotBase64);
      }
    };

    fetchSS();
  }, [deployedUrl]);

  useEffect(() => {
    confetti({
      particleCount: 300,
      spread: 100,
      origin: { y: 0 },
    });
  }, []);

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
              {screenshot ? (
                <Image
                  src={screenshot}
                  height={500}
                  width={1000}
                  alt="Website Screenshot"
                  className="rounded-[3px]"
                />
              ) : (
                <div className="w-[1000px] h-[350px] bg-gray-800 animate-pulse rounded-[3px]" />
              )}
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
