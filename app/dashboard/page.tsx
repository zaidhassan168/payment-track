"use client";
import { useEffect, useState } from "react";
import { getOverviewMetrics } from "@/app/services/overview";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, TrendingUp, Briefcase, CreditCard, ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement);

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<{
    totalToday: number;
    totalMonth: number;
    projects: { id: string; name: string }[];
    dailyTransfers?: { date: string; amount: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

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

  const filteredProjects = metrics?.projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const chartData = metrics?.dailyTransfers
    ? {
      labels: metrics.dailyTransfers.map((d) => d.date),
      datasets: [
        {
          label: 'Daily Transfers (Rs)',
          data: metrics.dailyTransfers.map((d) => d.amount),
          borderColor: 'rgba(99, 102, 241, 1)',
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
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
    <main className="min-h-screen bg-gradient-to-br">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          </div>
        ) : metrics ? (
          <>
            {/* Metrics Section */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-green-400 to-emerald-500 text-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-medium">Today's Transfers</CardTitle>
                  <CreditCard className="h-6 w-6 text-green-100" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    Rs {new Intl.NumberFormat('en-PK').format(metrics.totalToday)}
                  </div>
                  <p className="text-green-100 text-sm mt-1">+2.5% from yesterday</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-medium">Monthly Transfers</CardTitle>
                  <TrendingUp className="h-6 w-6 text-blue-100" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    Rs {new Intl.NumberFormat('en-PK').format(metrics.totalMonth)}
                  </div>
                  <p className="text-blue-100 text-sm mt-1">+5.2% from last month</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-400 to-pink-500 text-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-medium">Total Projects</CardTitle>
                  <Briefcase className="h-6 w-6 text-purple-100" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metrics.projects.length}</div>
                  <p className="text-purple-100 text-sm mt-1">+3 new this week</p>
                </CardContent>
              </Card>
            </section>

            {/* Analytics Section */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-gray-800">Analytics Overview</CardTitle>
                  {averageDaily && (
                    <div className="flex items-center bg-indigo-100 text-indigo-800 rounded-full px-3 py-1">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">
                        Avg Daily: Rs {new Intl.NumberFormat('en-PK').format(Number(averageDaily))}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {chartData ? (
                  <div className="w-full h-80">
                    <Line 
                      data={chartData}
                      options={{
                        responsive: true,
                        scales: {
                          y: {
                            beginAtZero: true,
                          },
                        },
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No daily transfer data available.</p>
                )}
              </CardContent>
            </Card>

            {/* Projects Section with Search */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <CardTitle className="text-2xl font-bold text-gray-800">Projects</CardTitle>
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 w-full"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredProjects && filteredProjects.length > 0 ? (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProjects.map((project) => (
                      <li 
                        key={project.id} 
                        className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer" 
                        onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                      >
                        <h3 className="text-lg font-semibold text-indigo-700">{project.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">Project ID: {project.id}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-8">No projects found.</p>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl text-gray-500">No data available at the moment.</p>
          </div>
        )}
      </div>
    </main>
  );
}

