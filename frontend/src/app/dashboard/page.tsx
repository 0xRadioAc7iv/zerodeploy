"use client";

import { signOut } from "next-auth/react";

export default function Home() {
  return (
    <div>
      <div>LOGGED IN!</div>
      <div>
        <button
          onClick={() => signOut()}
          className="border rounded-md px-2 py-2 font-semibold"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
