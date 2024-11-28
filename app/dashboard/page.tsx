"use client";

import { UserButton } from "@clerk/nextjs";
import { ClerkLogo } from "../components/clerk-logo";
import { NextLogo } from "../components/next-logo";
import { useEffect, useState } from "react";
import { getOverviewMetrics } from "@/app/services/overview";

export default function DashboardPage() {
  // State for metrics
  const [metrics, setMetrics] = useState<{
    totalToday: number;
    totalMonth: number;
    projects: { id: string; name: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch metrics inside useEffect
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getOverviewMetrics();
        setMetrics(data);
      } catch (error) {
        console.error("Error fetching overview metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
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

      {/* Welcome Section */}
      <section className="mb-6">
        <p className="text-[#5E5F6E] mt-2">
          Welcome to your dashboard. Explore your projects and manage tasks efficiently.
        </p>
      </section>

      {/* Metrics Section */}
      {loading ? (
        <p>Loading overview metrics...</p>
      ) : (
        metrics && (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {/* Total Transferred Today */}
              <div className="bg-white shadow rounded-lg p-4">
                <h2 className="text-lg font-bold mb-2">
                  Total Transferred Today
                </h2>
                <p className="text-2xl text-green-500 font-semibold">
                  Rs {metrics.totalToday}
                </p>
              </div>

              {/* Total Transferred This Month */}
              <div className="bg-white shadow rounded-lg p-4">
                <h2 className="text-lg font-bold mb-2">
                  Total Transferred This Month
                </h2>
                <p className="text-2xl text-green-500 font-semibold">
                  Rs {metrics.totalMonth}
                </p>
              </div>

              {/* Total Projects */}
              <div className="bg-white shadow rounded-lg p-4">
                <h2 className="text-lg font-bold mb-2">Total Projects</h2>
                <p className="text-2xl text-blue-500 font-semibold">
                  {metrics.projects.length}
                </p>
              </div>
            </section>

            {/* Projects Section */}
            <section>
              <h2 className="text-xl font-bold mb-4">Projects</h2>
              <ul className="list-disc pl-5">
                {metrics.projects.map((project) => (
                  <li key={project.id} className="text-gray-700">
                    {project.name}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )
      )}
    </main>
  );
}
