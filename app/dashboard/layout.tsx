'use client';
import { Sidebar } from "./components/sidebar";
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
        <main className="p-6 flex-grow bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}
