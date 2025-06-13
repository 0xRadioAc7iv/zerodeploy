"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { Plus, Settings } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { FaGithub } from "react-icons/fa";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";

export default function DashboardClient() {
  const [projects, setProjects] = useState<
    {
      id: string;
      userId: string;
      name: string;
      repository: string;
      deployedUrl: string;
    }[]
  >();

  useEffect(() => {
    const fetchProjects = async () => {
      const res = await fetch("/api/account/info");
      const data = await res.json();
      setProjects(data.projects);
    };

    fetchProjects();
  }, []);

  return (
    <main className="min-h-screen bg-black/95">
      <div className="flex items-center justify-between px-8 mt-4">
        <div className="text-white text-4xl">Your Projects</div>
        <Button variant="secondary" asChild>
          <Link href="/new">
            <Plus />
            <span className="text-lg font-semibold">New Project</span>
          </Link>
        </Button>
      </div>
      <div className="flex flex-col px-8 mt-6">
        {projects ? (
          projects.map((project, idx) => {
            return (
              <Card
                key={idx}
                className="py-3 bg-gray-700 border-gray-800 border-2 hover:border-gray-500 cursor-pointer transition-colors"
                onClick={() =>
                  (window.location.href = `/projects/${project.id}`)
                }
              >
                <CardContent className="flex justify-between items-center px-4">
                  <div className="flex flex-col">
                    <div className="flex gap-3">
                      <div className="text-gray-200 text-lg font-semibold">
                        {project.name}
                      </div>
                      <div className="flex text-sm text-white font-medium break-words">
                        <Link
                          href={project.repository}
                          target="_blank"
                          className="flex gap-1 items-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FaGithub size="16" />
                          <div className="font-semibold">
                            {project.repository.split("/").splice(3).join("/")}
                          </div>
                        </Link>
                      </div>
                    </div>
                    <Link
                      href={project.deployedUrl}
                      target="_blank"
                      className="text-gray-300 text-sm hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {project.deployedUrl.split("//")[1]}
                    </Link>
                  </div>
                  <div>
                    <Link href={`/projects/${project.id}/settings`}>
                      <Settings className="text-gray-300 transition-all hover:rotate-90" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Skeleton className="h-18" />
        )}
      </div>
    </main>
  );
}
