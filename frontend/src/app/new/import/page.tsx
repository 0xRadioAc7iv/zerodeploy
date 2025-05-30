"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ImportNewRepositoryPage() {
  const searchParams = useSearchParams();
  const repoUrl = searchParams.get("repo_url");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [framework, setFramework] = useState<string | null>(null);
  const [defaultBranch, setDefaultBranch] = useState<string | null>(null);
  const [installCommand, setInstallCommand] = useState("");
  const [buildCommand, setBuildCommand] = useState("");
  const [outputDirectory, setOutputDirectory] = useState("");

  async function handleDeployRepo() {
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
    }
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
      } catch (err: any) {
        setError(err.message || "Unexpected error");
      } finally {
        setLoading(false);
      }
    }

    detectRepoDetails();
  }, [repoUrl]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Import Repository</h1>

      {repoUrl && (
        <div>
          <p>Importing from Github</p>
          <p className="text-gray-600 mb-2">
            <Link href={repoUrl} target="_blank">
              Repo: {repoUrl}
            </Link>
            {defaultBranch && (
              <Link href={repoUrl} target="_blank">
                <span className="ml-2 text-sm text-gray-500">
                  (branch: {defaultBranch})
                </span>
              </Link>
            )}
          </p>
        </div>
      )}

      {loading && <p className="text-gray-500">Analyzing repository...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && framework && (
        <div className="mt-4 space-y-4">
          <p className="text-lg">
            Detected Framework:{" "}
            <span className="font-semibold">{framework}</span>
          </p>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Install Command</label>
            <input
              type="text"
              className="border p-2 rounded-md"
              value={installCommand}
              onChange={(e) => setInstallCommand(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Build Command</label>
            <input
              type="text"
              className="border p-2 rounded-md"
              value={buildCommand}
              onChange={(e) => setBuildCommand(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Output Directory</label>
            <input
              type="text"
              className="border p-2 rounded-md"
              value={outputDirectory}
              onChange={(e) => setOutputDirectory(e.target.value)}
            />
          </div>
          <button
            className="border-2 px-2 py-1 rounded-md cursor-pointer"
            onClick={handleDeployRepo}
          >
            Deploy
          </button>
        </div>
      )}
    </div>
  );
}
