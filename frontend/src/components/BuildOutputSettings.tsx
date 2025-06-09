"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type BuildOutputSettingsArguments = {
  framework: string;

  installCommand: string;
  buildCommand: string;
  outputDirectory: string;
  setInstallCommand: Dispatch<SetStateAction<string>>;
  setBuildCommand: Dispatch<SetStateAction<string>>;
  setOutputDirectory: Dispatch<SetStateAction<string>>;

  enableInstall: boolean;
  enableBuild: boolean;
  enableOutput: boolean;
  setEnableInstall: Dispatch<SetStateAction<boolean>>;
  setEnableBuild: Dispatch<SetStateAction<boolean>>;
  setEnableOutput: Dispatch<SetStateAction<boolean>>;
};

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

export default function BuildOutputSettings({
  framework,
  installCommand,
  buildCommand,
  outputDirectory,
  setInstallCommand,
  setBuildCommand,
  setOutputDirectory,
  enableInstall,
  enableBuild,
  enableOutput,
  setEnableInstall,
  setEnableBuild,
  setEnableOutput,
}: BuildOutputSettingsArguments) {
  const [isOpen, setIsOpen] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
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
        style={{ height: isOpen ? `${height + 12}px` : `${height}px` }}
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
                placeholder={frameworkPlaceholders.get(framework)?.buildCommand}
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
                    <p>The directory where your built files are located</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-3">
              <Input
                id="output-directory"
                value={outputDirectory}
                onChange={(e) => setOutputDirectory(e.target.value)}
                placeholder={frameworkPlaceholders.get(framework)?.outputFolder}
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
                    <p>The command to install your project dependencies</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-3">
              <Input
                id="install-command"
                value={installCommand}
                onChange={(e) => setInstallCommand(e.target.value)}
                placeholder={
                  frameworkPlaceholders.get(framework)?.installCommand
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
  );
}
