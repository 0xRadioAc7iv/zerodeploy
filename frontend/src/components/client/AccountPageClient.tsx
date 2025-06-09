"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "../ui/button";

export default function AccountSettingsPageClient() {
  const { data } = useSession();

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
    <div className="flex justify-center">
      <div className="mt-10">
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
  );
}
