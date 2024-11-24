import { UserButton } from "@clerk/nextjs";
import { ClerkLogo } from "../components/clerk-logo";
import { NextLogo } from "../components/next-logo";
import { currentUser } from '@clerk/nextjs/server'

export default async function DashboardPage() {
  // Fetch current user data
  const user = await currentUser()

  return (
    <>
      <main className="max-w-[75rem] w-full mx-auto px-6 py-4">
        {/* Header */}
        <header className="flex items-center justify-between border-b pb-4 mb-6">
          <div className="flex items-center gap-4">
            <ClerkLogo />
            <div aria-hidden className="w-px h-6 bg-[#C7C7C8]" />
            <NextLogo />
          </div>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                userButtonAvatarBox: "size-6",
              },
            }}
          />
        </header>

        {/* Main Content */}
        <section>
          <h1 className="text-2xl font-bold">Hello,{user?.firstName || "User"}!</h1>
          <p className="text-[#5E5F6E] mt-2">
            Welcome to your dashboard. Explore your projects and manage tasks efficiently.
          </p>
        </section>
      </main>
    </>
  );
}
