"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LayoutDashboard, CreditCard, FolderKanban, Settings, ChevronLeft, ChevronRight, Menu, HelpCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { signOut } from "next-auth/react"
const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsCollapsed(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, [setIsCollapsed]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-4 w-4" />
      </Button>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-background transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-64",
          isMobile && isCollapsed && "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col border-r">
          <div className="flex h-14 items-center justify-between px-3 py-4">
            {!isCollapsed && <h2 className="text-lg font-semibold">Dashboard</h2>}
            <Button
              variant="ghost"
              size="icon"
              className={cn("", isCollapsed && "ml-auto")}
              onClick={toggleSidebar}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center px-3 py-2">
           
            {!isCollapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-muted-foreground">john@example.com</p>
              </div>
            )}
          </div>
          <ScrollArea className="flex-1 px-3 py-2">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <TooltipProvider key={item.name}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          asChild
                          variant={isActive ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start",
                            isActive && "bg-secondary",
                            isCollapsed && "px-2"
                          )}
                        >
                          <Link href={item.href}>
                            <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                            {!isCollapsed && <span>{item.name}</span>}
                            {item.name === "Payments" && !isCollapsed && (
                              <Badge variant="outline" className="ml-auto">New</Badge>
                            )}
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="z-50">
                        {item.name}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </nav>
          </ScrollArea>
          <div className="mt-auto px-3 py-2">
            <Separator className="my-2" />
            <Button onClick={() => signOut()}> Sign Out </Button> 
            <Separator className="my-2" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/help">
                      <HelpCircle className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                      {!isCollapsed && <span>Help & Support</span>}
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="z-50">
                  Help & Support
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {!isCollapsed && (
              <p className="mt-2 text-xs text-muted-foreground">Version 1.0.0</p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
