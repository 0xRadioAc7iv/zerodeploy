"use client";

import Link from "next/link";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FaGithub } from "react-icons/fa";
import { Loader2Icon } from "lucide-react";
import clsx from "clsx";

const LOG_SERVICE_URL = process.env.NEXT_PUBLIC_LOG_SERVICE_URL as string;

export default function ImportNewRepositoryPage() {
  const searchParams = useSearchParams();
  const repoUrl = searchParams.get("repo_url");

  if (!repoUrl) {
    redirect("/new");
  }

  const [buildId, setBuildId] = useState<string>();
  const [deploymentState, setDeploymentState] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [framework, setFramework] = useState<string | null>(null);
  const [defaultBranch, setDefaultBranch] = useState<string | null>(null);
  const [installCommand, setInstallCommand] = useState("");
  const [buildCommand, setBuildCommand] = useState("");
  const [outputDirectory, setOutputDirectory] = useState("");

  const [enableInstall, setEnableInstall] = useState(false);
  const [enableBuild, setEnableBuild] = useState(false);
  const [enableOutput, setEnableOutput] = useState(false);

  const [isDeploying, setIsDeploying] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const logsEndRef = useRef<HTMLDivElement>(null);

  async function handleDeployRepo() {
    setIsDeploying(true);
    setDeploymentState(undefined);
    setLogs([]);

    const response = await fetch("/api/deploy", {
      method: "POST",
      body: JSON.stringify({
        repoUrl,
        defaultBranch,
        framework,
        installCommand,
        buildCommand,
        outputDirectory,
      }),
    });

    if (!response.ok) {
      console.error("Failed to deploy");
      setIsDeploying(false);
      return;
    }

    const data = await response.json();
    const id = data.buildId;
    setBuildId(id);
    pollStatus(id);
  }

  async function pollStatus(buildId: string) {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/status?buildId=${buildId}`);
      if (!res.ok) return;

      const data = await res.json();
      setDeploymentState(data.status);

      if (data.status.startsWith("Deployed:::")) {
        setIsDeploying(false);
        setIsDeployed(true);
        clearInterval(interval);
      }
    }, 1000);
  }

  useEffect(() => {
    async function detectRepoDetails() {
      if (!repoUrl) return;

      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `/api/github/info?repo_url=${encodeURIComponent(repoUrl)}`
        );
        if (!res.ok) throw new Error("Failed to analyze repository");

        const data = await res.json();
        setFramework(data.framework);
        setDefaultBranch(data.defaultBranch);
        setInstallCommand(data.installCommand);
        setBuildCommand(data.buildCommand);
        setOutputDirectory(data.outputDirectory);
        /* eslint-disable @typescript-eslint/no-explicit-any */
      } catch (err: any) {
        setError(err.message || "Unexpected error");
      } finally {
        setLoading(false);
      }
    }

    detectRepoDetails();
  }, [repoUrl]);

  useEffect(() => {
    if (!buildId) return;

    const sse = new EventSource(`${LOG_SERVICE_URL}/logs/${buildId}`);

    console.log(sse);

    sse.onmessage = (e) => {
      if (e.data === "__END__") {
        sse.close();
        return;
      }
      setLogs((prev) => [...prev, e.data]);
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    sse.onerror = (e) => {
      console.error("SSE error", e);
      sse.close();
    };

    return () => sse.close();
  }, [buildId]);

  return (
    <div className="min-h-screen px-4 py-10 flex items-start justify-center">
      <div
        className={clsx("transition-all duration-500 flex gap-6 w-full", {
          "max-w-7xl": logs.length > 0,
          "max-w-xl": logs.length === 0,
        })}
      >
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Import Repository
          </h1>
          <Card className="shadow-md">
            <CardContent className="space-y-4 pt-6">
              {repoUrl && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Importing from GitHub:
                  </p>
                  <div className="flex text-sm font-medium break-words">
                    <Link
                      href={repoUrl}
                      target="_blank"
                      className="flex gap-1.5 items-center"
                    >
                      <FaGithub size="20" />
                      <div className="font-semibold">
                        {repoUrl.split("/").splice(3).join("/")}
                      </div>
                    </Link>
                    {defaultBranch && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        branch: {defaultBranch}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, idx) => (
                    <Skeleton key={idx} className="h-10 w-full rounded-md" />
                  ))}
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertDescription>Error: {error}</AlertDescription>
                </Alert>
              ) : framework ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Framework Preset:{" "}
                    <span className="font-semibold text-foreground">
                      {framework}
                    </span>
                  </p>

                  {[
                    [
                      "Install",
                      installCommand,
                      setInstallCommand,
                      enableInstall,
                      setEnableInstall,
                    ],
                    [
                      "Build",
                      buildCommand,
                      setBuildCommand,
                      enableBuild,
                      setEnableBuild,
                    ],
                    [
                      "Output Directory",
                      outputDirectory,
                      setOutputDirectory,
                      enableOutput,
                      setEnableOutput,
                    ],
                  ].map(([label, value, setter, enabled, toggle], idx) => (
                    <div key={idx} className="space-y-2">
                      <Label>{label as string}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={value as string}
                          onChange={(e) =>
                            (
                              setter as React.Dispatch<
                                React.SetStateAction<string>
                              >
                            )(e.target.value)
                          }
                          disabled={!enabled}
                        />
                        <Switch
                          checked={enabled as boolean}
                          onCheckedChange={toggle as (checked: boolean) => void}
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    onClick={handleDeployRepo}
                    className="w-full mt-2 cursor-pointer"
                    disabled={loading || isDeploying || isDeployed}
                  >
                    {isDeploying ? (
                      <div className="flex items-center">
                        <Loader2Icon className="w-5 h-5 mr-2 animate-spin" />
                        Deploying...
                      </div>
                    ) : isDeployed ? (
                      "Deployed"
                    ) : (
                      "Deploy"
                    )}
                  </Button>

                  {deploymentState && (
                    <p className="text-sm mt-2 text-muted-foreground">
                      Deployment ID:{" "}
                      <span className="font-mono">{buildId}</span>
                    </p>
                  )}

                  {deploymentState?.startsWith("Deployed:::") && (
                    <Button asChild className="mt-2">
                      <Link
                        href={deploymentState.split(":::")[1]}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Visit Deployment
                      </Link>
                    </Button>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {logs.length > 0 && (
          <div className="w-full max-w-2xl bg-black text-green-300 font-mono text-sm rounded-xl shadow-md overflow-hidden flex flex-col">
            <div className="bg-gray-900 px-4 py-2 border-b border-gray-700">
              Build Logs
            </div>
            <div className="flex-1 overflow-auto px-4 py-3 bg-black space-y-1">
              {logs.map((log, idx) => (
                <pre key={idx} className="whitespace-pre-wrap">
                  {log}
                </pre>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
