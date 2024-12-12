import Image from "next/image";
import Link from "next/link";
import { ClerkLogo } from "./components/clerk-logo";
import { NextLogo } from "./components/next-logo";
import "./home.css";
import { signIn } from "@/auth"
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
            <form
      action={async () => {
        "use server"
        await signIn("google")
      }}
    >
      <button type="submit">Signin with Google</button>
    </form>

            </div>
          </section>
        </section>
      </main>
    </>
  );
}
