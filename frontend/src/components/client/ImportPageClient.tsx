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
import { FaGithub } from "react-icons/fa";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { RootDirectoryModal } from "@/components/RootDirectoryModal";
import { FolderItem } from "@/lib/interfaces";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import viteLogo from "@/assets/logos/vite.svg";
import Image from "next/image";
import BuildOutputSettings from "../BuildOutputSettings";
import { PiEmptyBold } from "react-icons/pi";

const LOG_SERVICE_URL = process.env.NEXT_PUBLIC_LOG_SERVICE_URL as string;

export default function ImportNewRepositoryPageClient() {
  const searchParams = useSearchParams();
  const repoUrl = searchParams.get("repo_url");

  if (!repoUrl) {
    redirect("/new");
  }

  const [buildId, setBuildId] = useState<string>();
  const [deploymentState, setDeploymentState] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [folderStructure, setFolderStructure] = useState<FolderItem[]>([]);
  const [rootDirectory, setRootDirectory] = useState("./");

  const [projectName, setProjectName] = useState<string>(
    repoUrl.split("/").splice(3)[1]
  );
  const [framework, setFramework] = useState<string>("other");
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
        rootDirectory,
        projectName,
      }),
    });

    if (!response.ok) {
      console.error("Failed to deploy");
      setIsDeploying(false);
      toast.error("Failed to deploy");
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
      } else if (data.status === "Failed to Deploy") {
        setIsDeploying(false);
        setIsDeployed(false);
        clearInterval(interval);
        toast.error("Failed to Deploy");
        console.error("Failed to Deploy");
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
        setDefaultBranch(data.defaultBranch);
        setFolderStructure(data.folderStructure);
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

    sse.onmessage = (e) => {
      if (e.data === "__END__") {
        sse.close();
        return;
      }
      if (e.data !== "ping") setLogs((prev) => [...prev, e.data]);
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
      <div className="transition-all duration-500 flex gap-6 w-full max-w-2xl">
        <div className="flex flex-col w-full gap-12">
          <Card className="bg-black/80 border-gray-700 border-2 shadow-md">
            <CardContent className="space-y-4">
              <h1 className="text-2xl text-white font-bold mb-4">
                New Project
              </h1>
              {repoUrl && (
                <div className="bg-gray-800 p-3 rounded-md">
                  <p className="text-sm text-gray-300 mb-1">
                    Importing from GitHub
                  </p>
                  <div className="flex text-sm text-white font-medium break-words">
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
                      <Badge variant="secondary" className="ml-2 text-xs">
                        branch: {defaultBranch}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-300">
                Project Name
                <div className="mt-2">
                  <Input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="my-project"
                    className="border-gray-700 border-2 h-10"
                  />
                </div>
              </div>

              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>Error: {error}</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-white">
                    <div className="text-gray-300">Framework Preset</div>
                    <div className="mt-2">
                      <Select value={framework} onValueChange={setFramework}>
                        <SelectTrigger className="w-full border-gray-700 border-2 cursor-pointer">
                          <SelectValue placeholder="Other" />
                        </SelectTrigger>
                        <SelectContent className="bg-black text-gray-300 max-h-60 overflow-y-auto">
                          <SelectItem
                            value="vite"
                            className="h-10 cursor-pointer"
                          >
                            <Image
                              src={viteLogo}
                              height={20}
                              width={20}
                              alt="Vite Logo"
                            />
                            Vite
                          </SelectItem>
                          <SelectItem
                            value="other"
                            className="h-10 cursor-pointer"
                          >
                            <PiEmptyBold />
                            Other
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="text-sm">
                    <div className="text-gray-300">Root Directory</div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-full cursor-not-allowed">
                        {loading ? (
                          <div className="flex gap-2">
                            <Skeleton className="w-full h-10" />
                          </div>
                        ) : (
                          <Input
                            value={rootDirectory}
                            className="text-white disabled:text-white disabled:opacity-100 tracking-wider font-semibold border-gray-700 border-2 h-10"
                            disabled
                          />
                        )}
                      </div>
                      <Button
                        variant="secondary"
                        className="h-10 hover:cursor-pointer"
                        onClick={() => setIsModalOpen(true)}
                        disabled={loading}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>

                  <BuildOutputSettings
                    framework={framework}
                    installCommand={installCommand}
                    buildCommand={buildCommand}
                    outputDirectory={outputDirectory}
                    setInstallCommand={setInstallCommand}
                    setBuildCommand={setBuildCommand}
                    setOutputDirectory={setOutputDirectory}
                    enableInstall={enableInstall}
                    enableBuild={enableBuild}
                    enableOutput={enableOutput}
                    setEnableInstall={setEnableInstall}
                    setEnableBuild={setEnableBuild}
                    setEnableOutput={setEnableOutput}
                  />

                  <Button
                    variant="secondary"
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
              )}
            </CardContent>
          </Card>

          <Card className="bg-black/80 border-gray-700 border-2 pb-0 h-96 shadow-md">
            <CardContent className="px-0 text-gray-400">
              <div className="flex flex-col gap-6 pl-6">
                <div className="text-2xl font-bold">Deployment</div>
                <div className="text-sm">
                  Once you&apos;re ready, start deploying to see the progress
                  here…
                </div>
              </div>
              <Image
                src="/globe-outline-dark-2.svg"
                height={200}
                width={700}
                alt="Globe Outline"
                className="rounded-md mt-8"
              />
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

        <RootDirectoryModal
          isOpen={isModalOpen}
          repositoryName={repoUrl.split("/").splice(3)[1]}
          onClose={() => setIsModalOpen(false)}
          onContinue={() => setIsModalOpen(false)}
          folderStructure={folderStructure}
          setRootDirectory={setRootDirectory}
        />
      </div>
    </div>
  );
}
