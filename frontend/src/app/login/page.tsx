"use client";

import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";

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
    <div>
      {status === "loading" && <div>Loading...</div>}
      <div className="flex flex-col items-start gap-2">
        <button
          className="flex items-center gap-3 px-6 py-3 bg-primary border-white border text-primary-foreground rounded-lg shadow-lg hover:bg-primary/90 cursor-pointer"
          onClick={handleLogin}
          disabled={loading}
          aria-label="Sign in with Github"
        >
          {loading ? (
            <span className="animate-pulse text-sm">Loading...</span>
          ) : (
            <>
              <FaGithub className="size-5" />
              Continue with GitHub
            </>
          )}
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    </div>
  );
}
