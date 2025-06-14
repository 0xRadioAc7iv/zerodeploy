import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { FolderItem } from "./interfaces";
import { env } from "@/env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseGitHubUrl(url: string) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)(\.git)?/);
  if (!match) throw new Error("Invalid GitHub URL");
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

export function generateFolderStructure(
  paths: string[],
  repoName: string
): FolderItem[] {
  const folders = new Set<string>();
  const filesInFolder: Record<string, string[]> = {};

  folders.add(".");

  for (const path of paths) {
    const parts = path.split("/");
    if (path.endsWith("/")) continue;

    for (let i = 1; i < parts.length; i++) {
      const folderPath = parts.slice(0, i).join("/");
      folders.add(folderPath);
    }

    const parent = parts.slice(0, -1).join("/") || ".";
    if (!filesInFolder[parent]) filesInFolder[parent] = [];
    filesInFolder[parent].push(parts.at(-1)!);
  }

  const detectFramework = (folder: string) => {
    const files = filesInFolder[folder] || [];
    const isVite = files.some((f) => /^vite\.config\.(js|ts|mjs|cjs)$/.test(f));

    if (isVite)
      return { hasFramework: true, framework: "vite", frameworkIcon: "vite" };
    return { hasFramework: false, framework: "other" };
  };

  const folderMap: Record<string, FolderItem> = {};

  const sortedFolders = Array.from(folders).sort((a, b) => a.length - b.length);
  for (const folder of sortedFolders) {
    const name = folder === "." ? repoName : folder.split("/").pop()!;
    const id = folder === "." ? "./" : folder;

    const { hasFramework, framework, frameworkIcon } = detectFramework(folder);

    folderMap[folder] = {
      id,
      name,
      type: "folder",
      hasFramework,
      framework,
      ...(hasFramework ? { frameworkIcon } : {}),
      children: [],
    };
  }

  for (const folder of sortedFolders) {
    if (folder === ".") continue;
    const parent = folder.split("/").slice(0, -1).join("/") || ".";
    folderMap[parent]?.children.push(folderMap[folder]);
  }

  return folderMap["."] ? [folderMap["."]] : [];
}

export async function sendEmail(
  type: string,
  fullName: string,
  recipient: string
) {
  try {
    await fetch(env.EMAIL_WORKER_URL, {
      method: "POST",
      body: JSON.stringify({ type, fullName, recipient }),
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to send email: ", error);
  }
}
