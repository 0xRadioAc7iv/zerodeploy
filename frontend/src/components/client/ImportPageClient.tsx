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
import { ChevronDown, Info, Loader2Icon } from "lucide-react";
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
import { PiEmptyBold } from "react-icons/pi";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const frameworkPlaceholders = new Map<
  string,
  { installCommand: string; buildCommand: string; outputFolder: string }
>([
  [
    "vite",
    {
      installCommand: "npm install",
      buildCommand: "npm run build",
      outputFolder: "dist",
    },
  ],
  [
    "other",
    {
      installCommand: "npm install",
      buildCommand: "npm run build",
      outputFolder: "public",
    },
  ],
]);

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
  const [installCommand, setInstallCommand] = useState(
    frameworkPlaceholders.get(framework)?.installCommand
  );
  const [buildCommand, setBuildCommand] = useState(
    frameworkPlaceholders.get(framework)?.buildCommand
  );
  const [outputDirectory, setOutputDirectory] = useState(
    frameworkPlaceholders.get(framework)?.outputFolder
  );

  const [enableInstall, setEnableInstall] = useState(false);
  const [enableBuild, setEnableBuild] = useState(false);
  const [enableOutput, setEnableOutput] = useState(false);

  const [isDeploying, setIsDeploying] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const [isOpen, setIsOpen] = useState(false);
  const [height, setHeight] = useState(0);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

    const resData = await response.json();

    if (!response.ok) {
      console.error("Failed to deploy");
      setIsDeploying(false);
      toast.error("Failed to deploy", {
        description:
          resData.msg || "There was an error while deploying your project",
      });
      return;
    }

    const id = resData.buildId;
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
    };

    sse.onerror = (e) => {
      console.error("SSE error", e);
      sse.close();
    };

    return () => sse.close();
  }, [buildId]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!deploymentState || !deploymentState.startsWith("Deployed:::")) return;

    return redirect(
      `/new/success?project_name=${encodeURIComponent(
        projectName
      )}&deployed_url=${encodeURIComponent(deploymentState.split(":::")[1])}`
    );
  }, [deploymentState, projectName]);

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
                      <Select
                        value={framework}
                        onValueChange={(value) => {
                          setFramework(value);
                          setInstallCommand(
                            frameworkPlaceholders.get(value)?.installCommand
                          );
                          setBuildCommand(
                            frameworkPlaceholders.get(value)?.buildCommand
                          );
                          setOutputDirectory(
                            frameworkPlaceholders.get(value)?.outputFolder
                          );
                        }}
                      >
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

                  <div className="w-full bg-black text-white rounded-lg border-gray-700 border-2">
                    <button
                      onClick={() => setIsOpen(!isOpen)}
                      className="flex items-center justify-between w-full py-2 px-3 text-left cursor-pointer transition-colors duration-200"
                    >
                      <h2 className="text-md font-medium text-gray-200">
                        Build and Output Settings
                      </h2>
                      <ChevronDown
                        className={`h-5 w-5 text-gray-400 transition-transform duration-300 ease-in-out ${
                          isOpen ? "transform rotate-180" : ""
                        }`}
                      />
                    </button>

                    <div
                      ref={contentRef}
                      className="px-3 overflow-hidden transition-all duration-300 ease-in-out"
                      style={{
                        height: isOpen ? `${height + 12}px` : `${height}px`,
                      }}
                    >
                      <div className="flex flex-col gap-3">
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor="build-command"
                              className="text-sm font-medium text-gray-300"
                            >
                              Build Command
                            </Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-4 w-4 text-gray-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>The command to build your project</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="flex items-center gap-3">
                            <Input
                              id="build-command"
                              value={buildCommand}
                              onChange={(e) => setBuildCommand(e.target.value)}
                              placeholder={
                                frameworkPlaceholders.get(framework)
                                  ?.buildCommand
                              }
                              className="border-gray-700 border-2"
                              disabled={!enableBuild}
                            />
                            <Switch
                              checked={enableBuild}
                              onCheckedChange={setEnableBuild}
                              className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-700"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor="output-directory"
                              className="text-sm font-medium text-gray-300"
                            >
                              Output Directory
                            </Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-4 w-4 text-gray-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    The directory where your built files are
                                    located
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="flex items-center gap-3">
                            <Input
                              id="output-directory"
                              value={outputDirectory}
                              onChange={(e) =>
                                setOutputDirectory(e.target.value)
                              }
                              placeholder={
                                frameworkPlaceholders.get(framework)
                                  ?.outputFolder
                              }
                              className="border-gray-700 border-2"
                              disabled={!enableOutput}
                            />
                            <Switch
                              checked={enableOutput}
                              onCheckedChange={setEnableOutput}
                              className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-700"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor="install-command"
                              className="text-sm font-medium text-gray-300"
                            >
                              Install Command
                            </Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-4 w-4 text-gray-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    The command to install your project
                                    dependencies
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="flex items-center gap-3">
                            <Input
                              id="install-command"
                              value={installCommand}
                              onChange={(e) =>
                                setInstallCommand(e.target.value)
                              }
                              placeholder={
                                frameworkPlaceholders.get(framework)
                                  ?.installCommand
                              }
                              className="border-gray-700 border-2"
                              disabled={!enableInstall}
                            />
                            <Switch
                              checked={enableInstall}
                              onCheckedChange={setEnableInstall}
                              className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-700"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    onClick={handleDeployRepo}
                    className="w-full mt-2 cursor-pointer"
                    disabled={loading || isDeploying || isDeployed}
                  >
                    {isDeploying ? (
                      <div className="flex items-center">
                        <Loader2Icon className="w-5 h-5 mr-2 animate-spin" />
                        Deploying
                      </div>
                    ) : isDeployed ? (
                      "Deployed"
                    ) : (
                      "Deploy"
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {logs.length > 0 ? (
            <Card className="bg-black/80 border-gray-700 border-2 shadow-md h-96 flex flex-col">
              <CardContent className="px-0 text-gray-400 flex flex-col overflow-auto">
                <div className="pl-6 pr-4 pb-3 border-b border-gray-700">
                  <h2 className="text-2xl font-bold text-white">
                    Build Logs{" "}
                    {buildId && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Deployment ID:{" "}
                        <span className="font-mono">{buildId}</span>
                      </p>
                    )}
                  </h2>
                </div>

                <div className="px-6 py-3 flex-1 overflow-y-auto text-green-300 font-mono text-sm bg-black">
                  {logs.map((log, idx) => (
                    <pre key={idx} className="whitespace-pre-wrap mb-1">
                      {log}
                    </pre>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </CardContent>
            </Card>
          ) : (
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
          )}
        </div>

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
