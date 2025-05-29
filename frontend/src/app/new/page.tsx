"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
    <div className="p-6">
      <div className="text-2xl font-semibold mb-4">Deploy a New Project</div>

      <input
        type="text"
        placeholder="Search from GitHub..."
        className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="text-gray-500">Loading repositories...</div>
      ) : repos.length === 0 ? (
        <div className="text-gray-500">No repositories found.</div>
      ) : (
        <ul className="space-y-4">
          {repos.map((repo) => (
            <li
              key={repo.id}
              className="p-4 border rounded-xl hover:shadow-md transition"
            >
              <div className="text-xl font-bold">{repo.name}</div>
              {repo.private && (
                <span className="ml-2 inline-block text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                  Private
                </span>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Last updated: {timeAgo(repo.updated_at)}
              </p>
              <Link
                href={`/new/import?repo_url=${encodeURIComponent(
                  repo.html_url
                )}`}
              >
                <button className="border-2 px-2 cursor-pointer">Import</button>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
