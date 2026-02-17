import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  ClerkLoaded,
  ClerkLoading,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

import React from "react";
import { Button } from "./ui/button";
import {
  ChevronDown,
  FileText,
  GraduationCap,
  LayoutDashboard,
  PenBox,
  StarsIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { checkUser } from "@/lib/checkUser";

// Define the growth tools with their respective icons
const GROWTH_TOOLS = [
  {
    href: "/resume-builder",
    label: "Build Resume",
    icon: FileText,
  },
  {
    href: "/cover-letter",
    label: "Cover Letter",
    icon: PenBox,
  },
  {
    href: "/interview-prep",
    label: "Interview Prep",
    icon: GraduationCap,
  },
];

const Header = async () => {
  await checkUser();
  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-backdrop-filter:bg-background/60">
      <nav className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        <Link href="/">
          {/* 1. Mobile Logo (Visible ONLY below sm) */}
          <Image
            src="/logosm.png"
            alt="Career Genie Logo"
            width={600}
            height={328}
            className="h-16 w-auto object-contain sm:hidden"
            priority
          />

          {/* 2. Desktop Logo (Visible ONLY on sm and above) */}
          <Image
            src="/logo.png"
            alt="Career Genie Logo"
            width={600}
            height={172}
            className="hidden sm:block h-16 md:h-20 py-1 w-auto object-contain"
            priority
          />
        </Link>

        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Show the navigation links when the user is signed in */}
          <SignedIn>
            <Link href="/dashboard">
              <Button variant="outline">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden md:block">Industry Insights</span>
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <StarsIcon className="h-4 w-4" />
                  <span className="hidden md:block">Growth Tools</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {GROWTH_TOOLS.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link
                      href={item.href}
                      className="cursor-pointer w-full flex items-center gap-2"
                    >
                      {/* Render the icon component dynamically */}
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Show the user button when the user is signed in */}
            {/* Show a loading state while Clerk is determining the user's authentication status */}
            <div className="flex items-center">
              <ClerkLoading>
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
              </ClerkLoading>
              <ClerkLoaded>
                <UserButton />
              </ClerkLoaded>
            </div>
          </SignedIn>

          {/* Show the sign in button when the user is signed out */}
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline">Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
};

export default Header;
