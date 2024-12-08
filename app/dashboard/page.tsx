"use client";

import { UserButton } from "@clerk/nextjs";
import { ClerkLogo } from "../components/clerk-logo";
import { NextLogo } from "../components/next-logo";
import { useEffect, useState } from "react";
import { getOverviewMetrics } from "@/app/services/overview";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement);

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<{
    totalToday: number;
    totalMonth: number;
    projects: { id: string; name: string }[];
    dailyTransfers?: { date: string; amount: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // For project search
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getOverviewMetrics(); 
        // data is now assumed to have dailyTransfers
        setMetrics(data);
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
    <main className="max-w-[75rem] w-full mx-auto px-6 py-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between border-b pb-4 mb-6">
        <div className="flex items-center gap-4">
          <ClerkLogo />
          <div aria-hidden className="w-px h-6 bg-gray-300" />
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
        <h1 className="text-2xl font-semibold text-gray-700">Welcome to your dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage your projects and expenses more efficiently with real-time insights.
        </p>
      </section>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : metrics ? (
        <>
          {/* Metrics Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-md font-medium text-gray-700 mb-1">Total Transferred Today</h2>
              <p className="text-2xl text-green-600 font-bold">
                Rs {new Intl.NumberFormat('en-PK').format(metrics.totalToday)}
              </p>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-md font-medium text-gray-700 mb-1">Total Transferred This Month</h2>
              <p className="text-2xl text-green-600 font-bold">
                Rs {new Intl.NumberFormat('en-PK').format(metrics.totalMonth)}
              </p>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-md font-medium text-gray-700 mb-1">Total Projects</h2>
              <p className="text-2xl text-blue-600 font-bold">
                {metrics.projects.length}
              </p>
            </div>
          </section>

          {/* Analytics Section */}
          <section className="mb-8 bg-white shadow rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-700">Analytics</h2>
              {averageDaily && (
                <p className="text-sm text-gray-600">Avg Daily: Rs {new Intl.NumberFormat('en-PK').format(Number(averageDaily))}</p>
              )}
            </div>
            {chartData ? (
              <div className="w-full h-64">
                <Line data={chartData} />
              </div>
            ) : (
              <p className="text-gray-500">No daily transfer data available.</p>
            )}
          </section>

          {/* Projects Section with Search */}
          <section className="mb-8 bg-white shadow rounded-lg p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4 sm:gap-0">
              <h2 className="text-xl font-bold text-gray-700">Projects</h2>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-48"
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
