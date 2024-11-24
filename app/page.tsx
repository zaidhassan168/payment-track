import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { ClerkLogo } from "./components/clerk-logo";
import { NextLogo } from "./components/next-logo";
import "./home.css";

export default function Home() {
  return (
    <>
      <main className="bg-[#FAFAFA] relative">
        <section className="max-w-[75rem] mx-auto bg-white border border-[#F2F2F2] rounded-md">
          {/* Header Section */}
          <header className="px-12 py-16 border-b border-[#F2F2F2]">
            <div className="bg-[#F4F4F5] px-4 py-3 rounded-full inline-flex items-center gap-4">
              <ClerkLogo />
              <div aria-hidden className="w-px h-6 bg-[#C7C7C8]" />
              <NextLogo />
            </div>
          </header>

          {/* Main Content */}
          <section className="p-10">
            <h1 className="text-5xl font-bold text-[#131316]">Welcome Back</h1>
            <p className="text-[#5E5F6E] mt-3 mb-6 max-w-[30rem] text-lg">
              Simplify your workflow with a Next.js template powered by Clerk authentication.
            </p>
            <div className="flex gap-4">
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-full bg-[#131316] text-white text-sm font-semibold"
                >
                  Go to Dashboard
                </Link>
              </SignedIn>
              <SignedOut>
                <SignInButton>
                  <button className="px-4 py-2 rounded-full bg-[#131316] text-white text-sm font-semibold">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </section>
        </section>
      </main>
    </>
  );
}
