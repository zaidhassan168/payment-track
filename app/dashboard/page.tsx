"use client";

import { useEffect, useState } from "react";
import { getOverviewMetrics } from "@/app/services/overview";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  Search,
  TrendingUp,
  Briefcase,
  CreditCard,
  ArrowUpRight,
  PlusCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion"; // Import motion from framer-motion
import {colors} from '@/styles/colors';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
);

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
          label: "Daily Transfers (Rs)",
          data: metrics.dailyTransfers.map((d) => d.amount),
          borderColor: "rgb(75, 192, 192)",
          tension: 0.4,
          fill: false,
        },
      ],
    }
    : null;

  const averageDaily = metrics?.dailyTransfers
    ? (
      metrics.dailyTransfers.reduce((sum, d) => sum + d.amount, 0) /
      metrics.dailyTransfers.length
    ).toFixed(2)
    : null;

  // Variants for card animations
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Dashboard
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-gray-500 dark:text-gray-400" />
          </div>
        ) : metrics ? (
          <>
            {/* Metrics Section */}
            <motion.section
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1, // Animate each card with a slight delay
                  },
                },
              }}
            >
              <motion.div variants={cardVariants}>
                <Card className="dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Today's Transfers
                    </CardTitle>
                    <CreditCard className="h-5 w-5  text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      Rs{" "}
                      {new Intl.NumberFormat("en-PK").format(metrics.totalToday)}
                    </div>
                    <Badge
                      variant="default"
                      className="mt-1 text-xs bg-green-100 text-green-700"
                    >
                      +2.5% from yesterday
                    </Badge>

                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={cardVariants}>
                <Card className="dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Monthly Transfers
                    </CardTitle>
                    <TrendingUp className="h-5 w-5  text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      Rs{" "}
                      {new Intl.NumberFormat("en-PK").format(
                        metrics.totalMonth
                      )}
                    </div>
                    <Badge variant="default" className="mt-1 text-xs bg-green-100 text-green-700">
                      +5.2% from last month
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={cardVariants}>
                <Card className="dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Projects
                    </CardTitle>
                    <Briefcase className="h-5 w-5  text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metrics.projects.length}
                    </div>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      +3 new this week
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.section>

            <Separator className="my-6" />

            {/* Analytics Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="dark:bg-gray-800 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                      Analytics Overview
                    </CardTitle>
                    {averageDaily && (
                      <Badge variant="outline">
                        Avg Daily: Rs{" "}
                        {new Intl.NumberFormat("en-PK").format(
                          Number(averageDaily)
                        )}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {chartData ? (
                    <div className="w-full h-80 mt-4">
                      <Line
                        data={chartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              grid: {
                                color: "rgba(0, 0, 0, 0.05)",
                              },
                              ticks: {
                                color: "rgb(107 114 128)",
                              },
                            },
                            x: {
                              grid: {
                                display: false,
                              },
                              ticks: {
                                color: "rgb(107 114 128)",
                              },
                            },
                          },
                          plugins: {
                            legend: {
                              display: false,
                            },
                            tooltip: {
                              backgroundColor: "rgba(255, 255, 255, 0.8)",
                              titleColor: "rgb(17 24 39)",
                              bodyColor: "rgb(75 85 99)",
                              borderColor: "rgba(0, 0, 0, 0.1)",
                              borderWidth: 1,
                              padding: 10,
                            },
                          },
                        }}
                      />
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No daily transfer data available.
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <Separator className="my-6" />

            {/* Projects Section with Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="dark:bg-gray-800 shadow-lg">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                      Projects
                    </CardTitle>
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <div className="relative w-full sm:w-64">
                        {/* Add a transition to the search icon */}
                        <motion.div
                          className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          <Search />
                        </motion.div>
                        <Input
                          placeholder="Search projects..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => router.push("/dashboard/projects/create")}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Project
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredProjects && filteredProjects.length > 0 ? (
                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.05, // Stagger project card animations
                          },
                        },
                      }}
                    >
                      {filteredProjects.map((project) => (
                        <motion.div
                          key={project.id}
                          variants={cardVariants}
                          whileHover={{ scale: 1.02 }} // Add a hover effect
                          whileTap={{ scale: 0.98 }} // Add a tap effect
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Card
                            className="hover:shadow-md transition-shadow cursor-pointer dark:bg-gray-700"
                            onClick={() =>
                              router.push(`/dashboard/projects/${project.id}`)
                            }
                          >
                            <CardHeader>
                              <CardTitle className="text-gray-900 dark:text-white">
                                {project.name}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {project.name}
                              </p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No projects found.
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl text-gray-500 dark:text-gray-400">
              No data available at the moment.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}