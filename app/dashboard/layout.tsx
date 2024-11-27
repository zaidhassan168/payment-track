'use client';
import { Sidebar } from "./components/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
// import { Navbar } from "./components/navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-grow">
        {/* Navbar */}
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
