"use client";

import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";

export default function Login() {
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
    <div className="min-h-screen flex flex-col">
      <main className="flex flex-col flex-grow items-center justify-center px-4">
        {status === "loading" ? (
          <p className="text-lg text-center">Loading...</p>
        ) : (
          <div className="flex flex-col items-center gap-10">
            <div className="text-4xl font-semibold">Log in to ZeroDeploy</div>
            <div className="flex flex-col items-center gap-6 max-w-xs w-full">
              <Button
                onClick={handleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 cursor-pointer"
                aria-label="Sign in with GitHub"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2Icon className="w-5 h-5 mr-2 animate-spin" />
                    Logging you in...
                  </>
                ) : (
                  <>
                    <FaGithub className="w-5 h-5" />
                    Continue with GitHub
                  </>
                )}
              </Button>

              {error && (
                <p className="text-red-600 text-sm text-center">{error}</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
