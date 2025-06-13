"use client";

import { signOut } from "next-auth/react";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <DropdownMenuItem
      className="flex justify-between cursor-pointer text-red-500 transition-colors duration-300"
      onClick={() => signOut()}
    >
      Log out
      <LogOut className="w-4 h-4" />
    </DropdownMenuItem>
  );
}
