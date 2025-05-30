"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { status } = useSession();

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
      {status === "unauthenticated" ? (
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
      ) : (
        <div>
          <button
            onClick={() => signOut()}
            className="border rounded-md px-2 py-2 font-semibold cursor-pointer"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
