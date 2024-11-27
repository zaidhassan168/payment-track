"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  CreditCard,
  FolderKanban,
  Settings,
} from "lucide-react"
import { UserButton } from "@clerk/nextjs";
import { ClerkLogo } from "@/app/components/clerk-logo";
import { NextLogo } from "@/app/components/next-logo";
import { currentUser } from '@clerk/nextjs/server'

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-background border-r h-screen flex flex-col">
      <div className="p-6">
        <h2 className="text-lg font-semibold">My Dashboard</h2>
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
      </div>
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Button
              key={item.name}
              asChild
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                isActive && "bg-secondary"
              )}
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            </Button>

            
          )
        })}
      </nav>
    </aside>
  )
}
