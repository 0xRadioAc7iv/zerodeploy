import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Home, LayoutDashboard, Settings } from "lucide-react";
import LogoutButton from "./LogoutButton";

export default async function Header() {
  const session = await getServerSession(authOptions);

  return (
    <header className="w-full sticky top-0 bg-black border-b border-white/15 shadow-sm z-50">
      <div className="flex items-center justify-between py-4 px-6 mx-auto">
        <div className="flex items-center space-x-14">
          <Link
            href="/"
            className="flex items-stretch gap-2 py-1 focus-visible:outline-2"
          >
            <Image
              src="/logos/main_logo_white.svg"
              alt="ZeroDeploy"
              width={20}
              height={20}
              className="align-middle"
            />
            <span className="text-xl text-white font-bold leading-none tracking-tight">
              ZeroDeploy
            </span>
          </Link>

          {/* <nav className="hidden md:flex items-center space-x-8 text-sm text-gray-500">
            <Link
              href="/docs"
              className="hover:text-black transition-colors font-medium"
            >
              Documentation
            </Link>
          </nav> */}
        </div>

        {session ? (
          <div className="flex items-center gap-3">
            <Button variant="secondary" className="h-8" asChild>
              <Link href="/contact" className="select-none">
                Contact
              </Link>
            </Button>
            <Button variant="secondary" className="h-8" asChild>
              <Link href="/dashboard" className="select-none">
                Dashboard
              </Link>
            </Button>
            <div className="border border-gray-700 rounded-full cursor-pointer">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div
                    className="rounded-full cursor-pointer transition select-none"
                    tabIndex={0}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user.image} />
                      <AvatarFallback>
                        {session.user.name
                          ?.split(" ")[0][0]
                          .concat(session.user.name?.split(" ")[1][0])}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-64 bg-black text-white border-2 border-gray-700 shadow-lg rounded-xl p-2 mt-2"
                >
                  <DropdownMenuLabel className="text-white">
                    <div className="text-base font-semibold">
                      {session.user.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {session.user.email}
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="bg-gray-500" />

                  <Link href="/dashboard">
                    <DropdownMenuItem className="flex justify-between cursor-pointer transition-colors duration-300 hover:bg-gray-800">
                      Dashboard
                      <LayoutDashboard className="w-4 h-4" />
                    </DropdownMenuItem>
                  </Link>

                  <Link href="/account">
                    <DropdownMenuItem className="flex justify-between cursor-pointer transition-colors duration-300 hover:bg-gray-800">
                      Account Settings
                      <Settings className="w-4 h-4" />
                    </DropdownMenuItem>
                  </Link>

                  <Link href="/">
                    <DropdownMenuItem className="flex justify-between cursor-pointer transition-colors duration-300 hover:bg-gray-800">
                      Home Page
                      <Home className="w-4 h-4" />
                    </DropdownMenuItem>
                  </Link>

                  <DropdownMenuSeparator className="bg-gray-500" />

                  <LogoutButton />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex items-center space-x-3">
            <Button className="bg-gray-800 h-8" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button variant="secondary" className="h-8" asChild>
              <Link href="/contact">Contact</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
