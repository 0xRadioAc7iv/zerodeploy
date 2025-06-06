"use client";

import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";

export default function LoginClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { status } = useSession();

  if (status === "authenticated") {
    redirect("/new");
  }

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await signIn("github", {
        callbackUrl: "/new",
        redirect: false,
      });

      if (res?.error) {
        setError("Login failed. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black px-4 py-20 flex flex-col items-center justify-center text-center">
      {status === "loading" ? (
        <p className="text-lg text-gray-700">Loading...</p>
      ) : (
        <div className="flex flex-col items-center gap-10">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Log in to ZeroDeploy
            </h1>
            <p className="text-lg text-gray-400">
              One-click deploys. GitHub-powered builds. Just log in and ship
              your ideas.
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 max-w-xs w-full">
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="bg-gray-800 w-full flex items-center justify-center gap-2 px-6 py-3 cursor-pointer"
              aria-label="Sign in with GitHub"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2Icon className="w-5 h-5 animate-spin" />
                  Logging you in...
                </>
              ) : (
                <>
                  <FaGithub className="w-5 h-5" />
                  Continue with GitHub
                </>
              )}
            </Button>
            {/* <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 cursor-pointer"
              aria-label="Sign in with GitHub"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2Icon className="w-5 h-5 animate-spin" />
                  Logging you in...
                </>
              ) : (
                <>
                  <FaGitlab className="w-5 h-5" />
                  Continue with Gitlab
                </>
              )}
            </Button>
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 cursor-pointer"
              aria-label="Sign in with GitHub"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2Icon className="w-5 h-5 animate-spin" />
                  Logging you in...
                </>
              ) : (
                <>
                  <FaBitbucket className="w-5 h-5" />
                  Continue with Bitbucket
                </>
              )}
            </Button> */}

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
