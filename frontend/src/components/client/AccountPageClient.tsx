"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { Loader2Icon } from "lucide-react";

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
  const [isDeleting, setIsDeleting] = useState(false);

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

    setIsDeleting(true);

    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.user?.email }),
      });

      const result = await res.json();
      setIsDeleting(false);

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
      <div className="flex flex-col w-full max-w-md mt-10 gap-12">
        <div className="text-white text-5xl text-center font-bold">
          Your Account
        </div>

        <div className="flex flex-col gap-8">
          {projects ? (
            <div className="rounded-lg border p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm text-white font-medium">
                  Projects Limit
                </h3>
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
                  style={{
                    width: `${(projects.length / projectsLimit) * 100}%`,
                  }}
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
              disabled={!data || isDeleting}
            >
              {isDeleting ? (
                <div className="flex items-center">
                  <Loader2Icon className="w-5 h-5 mr-2 animate-spin" />
                  Deleting
                </div>
              ) : (
                "Delete Account"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
