"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LayoutDashboard, CreditCard, FolderKanban, Settings, ChevronLeft, ChevronRight, Menu, HelpCircle } from 'lucide-react';
import { UserButton } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@clerk/nextjs";
import { colors } from "@/styles/colors";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard, color: colors.primary },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard, color: colors.accent },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban, color: colors.secondary },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, color: colors.info },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useUser();

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
      <motion.aside
        initial={isMobile ? { x: "-100%" } : { width: isCollapsed ? 64 : 256 }}
        animate={
          isMobile
            ? { x: isCollapsed ? "-100%" : 0 }
            : { width: isCollapsed ? 64 : 256 }
        }
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-background",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-full flex-col border-r border-border">
          <div className="flex h-14 items-center justify-between px-3 py-4 bg-gradient-to-r from-primary/10 to-secondary/10">
            {!isCollapsed && (
              <h2 className="text-lg font-semibold text-primary">Dashboard</h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={cn("hover:bg-secondary/20", isCollapsed && "ml-auto")}
              onClick={toggleSidebar}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-primary" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-primary" />
              )}
            </Button>
          </div>
          <div className="flex items-center px-3 py-4 bg-gradient-to-r from-accent/5 to-info/5">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: isCollapsed ? "w-8 h-8" : "w-10 h-10",
                },
              }}
            />
            {!isCollapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium text-primary">
                  {user?.fullName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.primaryEmailAddress?.toString()}
                </p>
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
                            "w-full justify-start transition-colors",
                            isActive && "bg-secondary/20 text-secondary-foreground",
                            isCollapsed && "px-2",
                            "hover:bg-secondary/10"
                          )}
                        >
                          <Link href={item.href}>
                            <item.icon
                              className={cn(
                                "h-5 w-5",
                                !isCollapsed && "mr-2",
                                "transition-transform duration-200 ease-in-out",
                                "hover:scale-110"
                              )}
                              style={{ 
                                stroke: isActive ? item.color : colors.mutedForeground,
                                fill: "none",
                                strokeWidth: 1.5
                              }}
                            />
                            {!isCollapsed && <span>{item.name}</span>}
                            {item.name === "Payments" && !isCollapsed && (
                              <Badge variant="secondary" className="ml-auto">
                                New
                              </Badge>
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
          <div className="mt-auto px-3 py-4 bg-gradient-to-r from-muted/20 to-background">
            <Separator className="my-2" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-secondary/10"
                    asChild
                  >
                    <Link href="/help">
                      <HelpCircle
                        className={cn(
                          "h-5 w-5",
                          !isCollapsed && "mr-2",
                          "transition-transform duration-200 ease-in-out",
                          "hover:scale-110"
                        )}
                        style={{ 
                          stroke: colors.warning,
                          fill: "none",
                          strokeWidth: 1.5
                        }}
                      />
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
              <p className="mt-2 text-xs text-muted-foreground text-center">
                Version 1.0.0
              </p>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}

