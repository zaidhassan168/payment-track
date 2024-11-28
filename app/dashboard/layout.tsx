'use client';

import { useState } from "react";
import { Sidebar } from "./components/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content Area */}
      <div className={cn(
        "flex flex-col flex-grow transition-all duration-300 ease-in-out",
        isCollapsed ? "md:ml-16" : "md:ml-64"
      )}>
        {/* Navbar */}
        {/* If you want to add a Navbar component, you can uncomment the following line */}
        {/* <Navbar /> */}

        {/* Page Content */}
        <ScrollArea className="h-full w-full">
          <main className="p-6 flex-grow bg-gray-100">
            {children}
          </main>
        </ScrollArea>
      </div>
    </div>
  );
}
