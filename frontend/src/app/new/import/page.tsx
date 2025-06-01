"use client";

import Link from "next/link";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FaGithub } from "react-icons/fa";

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

  async function handleDeployRepo() {
    setIsDeploying(true);
    setDeploymentState(undefined);
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-xl space-y-6">
        <h1 className="text-center text-3xl font-bold">Import Repository</h1>
        <Card>
          <CardContent className="space-y-4">
            {repoUrl && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Importing from GitHub:
                </p>
                <div className="flex text-sm font-medium break-words">
                  <Link href={repoUrl} target="_blank" className="flex gap-1.5">
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

                <div className="space-y-2">
                  <Label>Install Command</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={installCommand}
                      onChange={(e) => setInstallCommand(e.target.value)}
                      disabled={!enableInstall}
                    />
                    <Switch
                      checked={enableInstall}
                      onCheckedChange={setEnableInstall}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Build Command</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={buildCommand}
                      onChange={(e) => setBuildCommand(e.target.value)}
                      disabled={!enableBuild}
                    />
                    <Switch
                      checked={enableBuild}
                      onCheckedChange={setEnableBuild}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Output Directory</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={outputDirectory}
                      onChange={(e) => setOutputDirectory(e.target.value)}
                      disabled={!enableOutput}
                    />
                    <Switch
                      checked={enableOutput}
                      onCheckedChange={setEnableOutput}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleDeployRepo}
                  className="w-full mt-2 cursor-pointer"
                  disabled={loading || isDeploying}
                >
                  {isDeploying ? "Deploying..." : "Deploy"}
                </Button>

                {deploymentState &&
                  deploymentState.startsWith("Deployed:::") && (
                    <div>
                      <p>Deployment ID: {buildId}</p>
                      <p className="text-sm mt-2 text-blue-600">
                        <Button asChild>
                          <Link
                            href={deploymentState.split(":::")[1]}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Visit Deployment
                          </Link>
                        </Button>
                      </p>
                    </div>
                  )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
