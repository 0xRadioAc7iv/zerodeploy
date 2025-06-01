"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { TextMuted } from "@/components/ui/text-muted"; // Optional component
import { Skeleton } from "@/components/ui/skeleton"; // Optional for loading
import { Lock } from "lucide-react";

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
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  }

  if (diff < 60) return `${diff} second${diff !== 1 ? "s" : ""} ago`;

  if (diff < 3600)
    return `${Math.floor(diff / 60)} minute${
      Math.floor(diff / 60) !== 1 ? "s" : ""
    } ago`;

  if (diff < 86400)
    return `${Math.floor(diff / 3600)} hour${
      Math.floor(diff / 3600) !== 1 ? "s" : ""
    } ago`;

  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

export default function NewProjectPage() {
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-2xl flex flex-col items-center justify-center space-y-6">
        <h1 className="text-center text-3xl font-bold">Deploy a New Project</h1>

        <Input
          type="text"
          placeholder="Search from your GitHub..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />

        <div className="w-full flex-grow flex flex-col justify-center">
          {loading ? (
            <div className="space-y-4 mt-6">
              {[...Array(5)].map((_, idx) => (
                <Skeleton key={idx} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : repos.length === 0 ? (
            <p className="text-center text-muted-foreground mt-6">
              No repositories found.
            </p>
          ) : (
            <div className="space-y-4 overflow-auto">
              {repos.map((repo) => (
                <Card key={repo.id} className="hover:shadow-md transition">
                  <CardContent className="">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div>
                        <div className="text-base font-medium flex items-center gap-2">
                          {repo.name}
                          {repo.private && (
                            <Lock className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Last updated: {timeAgo(repo.updated_at)}
                        </p>
                      </div>
                      <Link
                        href={`/new/import?repo_url=${encodeURIComponent(
                          repo.html_url
                        )}`}
                      >
                        <Button variant="outline" className="mt-2 sm:mt-0">
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
