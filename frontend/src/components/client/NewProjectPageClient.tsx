"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, Search } from "lucide-react";

type Repo = {
  id: number;
  name: string;
  html_url: string;
  private: boolean;
  updated_at: string;
};

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  const days = Math.floor(diff / 86400);

  if (days > 7) {
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  }

  if (diff < 60) return `${diff}s ago`;

  if (diff < 3600) return `${Math.floor(diff / 60)}min ago`;

  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

  return `${days}d ago`;
}

export default function NewProjectPageClient() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [originalRepos, setOriginalRepos] = useState<Repo[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchRepos() {
    setLoading(true);
    const res = await fetch("/api/github/repos");
    const data = await res.json();
    setRepos(data);
    setOriginalRepos(data);
    setLoading(false);
  }

  async function searchRepos(query: string) {
    if (!query.trim()) {
      setRepos(originalRepos);
      return;
    }

    setLoading(true);
    const res = await fetch(
      `/api/github/search?query=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    setRepos(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchRepos();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      searchRepos(search);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex flex-col gap-3 text-white items-center pt-4">
        <div className="text-5xl">Let's build something cool.</div>
        <div className="text-lg">
          To deploy a new Project, Import an existing Git Repository.
        </div>
      </div>
      <div className="w-full max-w-2xl flex flex-col items-center justify-center mt-8 space-y-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/80 text-white placeholder-gray-400 border border-white/10 focus:border-white focus:ring-0 focus:outline-none rounded-md pl-10"
          />
        </div>

        <div className="w-full flex-grow flex flex-col justify-center">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, idx) => (
                <Skeleton key={idx} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : repos.length === 0 ? (
            <p className="text-center text-white mt-6">
              No repositories found.
            </p>
          ) : (
            <div className="space-y-4 overflow-auto">
              {repos.map((repo) => (
                <Card
                  key={repo.id}
                  className="bg-black text-white border-gray-800"
                >
                  <CardContent>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div>
                        <div className="text-base font-medium flex items-center gap-2">
                          {repo.name}
                          {repo.private && <Lock className="w-4 h-4 " />}
                          <span className="text-gray-300">·</span>
                          <p className="text-gray-400">
                            {timeAgo(repo.updated_at)}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/new/import?repo_url=${encodeURIComponent(
                          repo.html_url
                        )}`}
                      >
                        <Button
                          variant="secondary"
                          className="mt-2 sm:mt-0 cursor-pointer"
                        >
                          Import
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
