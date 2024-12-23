"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LayoutDashboard, CreditCard, FolderKanban, Settings, Menu, HelpCircle, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { UserButton, useUser, SignOutButton,  } from "@clerk/nextjs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input"; // Removed
const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  readonly isCollapsed: boolean;
  readonly setIsCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useUser();
  const [showSignOut, setShowSignOut] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsCollapsed(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [setIsCollapsed]);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <Menu className="h-4 w-4" />
      </Button>
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 80 : 280,
          transition: { duration: 0.2 }
        }}
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r border-border bg-background",
          isCollapsed ? "w-20" : "w-[280px]"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo & Brand */}
          <div className="flex h-16 items-center gap-2 border-b border-border px-4">
            <div className="flex items-center gap-2 font-semibold">
              🍊
              {!isCollapsed && <span className="text-lg text-primary">GridLine</span>}
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3">
            <nav className="flex flex-col gap-1 py-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <TooltipProvider key={item.name}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          asChild
                          variant="ghost"
                          className={cn(
                            "w-full justify-start gap-2",
                            isActive && "bg-accent text-accent-foreground",
                            !isCollapsed && "px-2",
                          )}
                        >
                          <Link href={item.href} className="flex items-center gap-2">
                            <item.icon className={cn(
                              "h-4 w-4",
                              isActive ? "text-primary" : "text-muted-foreground"
                            )} />
                            {!isCollapsed && (
                                <span className={cn(
                                  "flex-1",
                                  isActive && "font-medium"
                                )}>{item.name}</span>
                            )}
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right" className="flex items-center gap-4">
                          {item.name}
                          {item.name === "Payments" && (
                            <Badge variant="secondary">New</Badge>
                          )}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </nav>
          </ScrollArea>

          {/* User & Help */}
          <div className="border-t border-border p-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <UserButton
                  
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-8 h-8",
                    },
                  }}
                />
                {!isCollapsed && (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user?.fullName}</span>
                    <span className="text-xs text-muted-foreground">
                      {user?.primaryEmailAddress?.toString()}
                    </span>
                  </div>
                )}
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className={cn("w-full justify-start", "bg-red-100")}>
                    <LogOut className="h-4 w-4 text-red-500" />
                    {!isCollapsed && <span>Sign Out</span>}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Sign Out</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to log out?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <SignOutButton signOutOptions={{ redirectUrl: '/sign-in' }}>
                      <Button variant="destructive">Sign Out</Button>
                    </SignOutButton>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                      asChild
                    >
                      <Link href="/help">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        {!isCollapsed && <span>Help & Support</span>}
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      Help & Support
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          {/* Collapsible Button */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  <span>Collapse</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
