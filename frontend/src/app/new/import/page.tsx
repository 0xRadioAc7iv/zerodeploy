"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ImportNewRepositoryPage() {
  const searchParams = useSearchParams();
  const repoUrl = searchParams.get("repo_url");

  const [framework, setFramework] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function detectFramework() {
      if (!repoUrl) return;

      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `/api/github/files?repo_url=${encodeURIComponent(repoUrl)}`
        );
        if (!res.ok) throw new Error("Framework detection failed");

        const data = await res.json();
        setFramework(data.framework ?? "Unknown");
      } catch (err: any) {
        setError(err.message || "Unexpected error");
      } finally {
        setLoading(false);
      }
    }

    detectFramework();
  }, [repoUrl]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Import Repository</h1>

      {repoUrl && <p className="text-gray-600 mb-2">Repo: {repoUrl}</p>}

      {loading && <p className="text-gray-500">Analyzing repository...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && framework && (
        <div className="mt-4">
          <p className="text-lg">
            Detected Framework:{" "}
            <span className="font-semibold">{framework}</span>
          </p>
        </div>
      )}
    </div>
  );
}
