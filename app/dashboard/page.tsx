"use client";

import { UserButton } from "@clerk/nextjs";
import { ClerkLogo } from "../components/clerk-logo";
import { NextLogo } from "../components/next-logo";
import { useEffect, useState } from "react";
import { getOverviewMetrics } from "@/app/services/overview";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement);

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<{
    totalToday: number;
    totalMonth: number;
    projects: { id: string; name: string }[];
    dailyTransfers?: { date: string; amount: number }[]; // Additional data for charts
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // For project search
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getOverviewMetrics();
        // data could include dailyTransfers if your backend supports it
        // Otherwise, mock it:
        const mockDailyTransfers = [
          { date: "2023-07-01", amount: 1200 },
          { date: "2023-07-02", amount: 800 },
          { date: "2023-07-03", amount: 1500 },
          { date: "2023-07-04", amount: 2000 },
          { date: "2023-07-05", amount: 900 },
        ];

        setMetrics({
          ...data,
          dailyTransfers: mockDailyTransfers,
        });
      } catch (error) {
        console.error("Error fetching overview metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const filteredProjects = metrics?.projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Chart Setup
  const chartData = metrics?.dailyTransfers
    ? {
        labels: metrics.dailyTransfers.map((d) => d.date),
        datasets: [
          {
            label: 'Daily Transfers (Rs)',
            data: metrics.dailyTransfers.map((d) => d.amount),
            borderColor: 'rgba(75,192,192,1)',
            backgroundColor: 'rgba(75,192,192,0.2)',
            tension: 0.3,
            fill: true,
          },
        ],
      }
    : null;

  const averageDaily = metrics?.dailyTransfers
    ? (metrics.dailyTransfers.reduce((sum, d) => sum + d.amount, 0) / metrics.dailyTransfers.length).toFixed(2)
    : null;

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
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-500">Loading overview metrics...</p>
        </div>
      ) : metrics ? (
        <>
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Total Transferred Today */}
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-lg font-bold mb-2">Total Transferred Today</h2>
              <p className="text-2xl text-green-500 font-semibold">
                Rs {metrics.totalToday}
              </p>
            </div>

            {/* Total Transferred This Month */}
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-lg font-bold mb-2">Total Transferred This Month</h2>
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

          {/* Analytics Section */}
          <section className="mb-6 bg-white shadow rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Analytics</h2>
              {averageDaily && (
                <p className="text-sm text-gray-600">Average Daily Transfer: Rs {averageDaily}</p>
              )}
            </div>
            {chartData ? (
              <div className="w-full h-64">
                <Line data={chartData} />
              </div>
            ) : (
              <p className="text-gray-500">No daily transfer data available</p>
            )}
          </section>

          {/* Projects Section with Search */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Projects</h2>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48"
                />
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                >
                  Clear
                </Button>
              </div>
            </div>
            {filteredProjects && filteredProjects.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {filteredProjects.map((project) => (
                  <li key={project.id} className="text-gray-700">
                    {project.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No projects found.</p>
            )}
          </section>
        </>
      ) : (
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-500">No data available at the moment.</p>
        </div>
      )}
    </main>
  );
}
