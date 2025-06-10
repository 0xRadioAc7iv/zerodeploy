"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";

const projectsLimit = 1;

export default function AccountSettingsPageClient() {
  const { data } = useSession();

  const [projects, setProjects] = useState<
    {
      id: string;
      userId: string;
      name: string;
      repository: string;
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

  const deleteHandler = async () => {
    if (!data) return;

    const confirmed = confirm("Are you sure you want to delete your account?");
    if (!confirmed) return;

    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.user?.email }),
      });

      const result = await res.json();

      if (result.success) {
        await signOut({ callbackUrl: "/" });
      } else {
        alert(`Failed to delete account: ${result.message}`);
      }
    } catch (e) {
      console.error(e);
      alert("Unexpected error occurred.");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mt-10 w-full max-w-md space-y-6">
        {projects ? (
          <div className="rounded-lg border p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm text-white font-medium">Projects Limit</h3>
              <span
                className={`text-sm font-medium ${
                  projects.length >= projectsLimit
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {projects.length}/{projectsLimit}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  projects.length >= projectsLimit
                    ? "bg-red-500"
                    : "bg-green-500"
                )}
                style={{ width: `${(projects.length / projectsLimit) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <Skeleton className="h-16 w-full" />
        )}

        <div className="flex justify-center">
          <Button
            variant="destructive"
            className="cursor-pointer"
            onClick={deleteHandler}
            disabled={!data}
          >
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
