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
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, TrendingUp, Briefcase, CreditCard, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  Filler
);

interface Project {
  id: string;
  name: string;
  client: string;
  budget: number;
  spent: number;
  paymentTransferred: number;
  paymentSummary: {
    totalExpenses: {
      deduction: number;
      extraExpense: number;
      clientExpense: number;
      projectExpense: number;
    };
    balance: number;
    totalIncome: number;
  };
}

interface Metrics {
  totalToday: number;
  totalMonth: number;
  projects: Project[];
  last10DaysTransfers: { date: string; amount: number }[];
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
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

  const chartData = metrics?.last10DaysTransfers
    ? {
        labels: metrics.last10DaysTransfers.map((d) => d.date),
        datasets: [
          {
            label: "Daily Transfers",
            data: metrics.last10DaysTransfers.map((d) => d.amount),
            borderColor: "hsl(var(--primary))",
            backgroundColor: "hsl(var(--primary) / 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "hsl(var(--border) / 0.2)",
        },
      },
    },
  };

  const calculateTotalBudget = (projects: Project[]) => {
    return projects.reduce((total, project) => total + project.budget, 0);
  };

  const calculateTotalSpent = (projects: Project[]) => {
    return projects.reduce((total, project) => total + project.spent, 0);
  };

  const calculateTotalBalance = (projects: Project[]) => {
    return projects.reduce((total, project) => total + project.paymentSummary.balance, 0);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex h-[200px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!metrics) {
      return (
        <div className="flex h-[200px] items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </div>
      );
    }

    return (
      <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Transfers
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rs {new Intl.NumberFormat("en-PK").format(metrics.totalToday)}
              </div>
              <p className="text-xs text-muted-foreground">
                +{((metrics.totalToday / metrics.totalMonth) * 100).toFixed(2)}% of monthly total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Transfers
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rs {new Intl.NumberFormat("en-PK").format(metrics.totalMonth)}
              </div>
              <p className="text-xs text-muted-foreground">
                For {new Date().toLocaleString('default', { month: 'long' })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Projects
              </CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.projects.length}</div>
              <p className="text-xs text-muted-foreground">
                Total Budget: Rs {new Intl.NumberFormat("en-PK").format(calculateTotalBudget(metrics.projects))}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Spent
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rs {new Intl.NumberFormat("en-PK").format(calculateTotalSpent(metrics.projects))}
              </div>
              <p className="text-xs text-muted-foreground">
                Balance: Rs {new Intl.NumberFormat("en-PK").format(calculateTotalBalance(metrics.projects))}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Last 10 Days Transfers</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px]">
                {chartData && <Line data={chartData} options={chartOptions} />}
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>
                You have {metrics.projects.length} total projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {metrics.projects.slice(0, 5).map((project) => (
                  <div className="flex items-center" key={project.id}>
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{project.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{project.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Client: {project.client}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      <Progress
                        value={(project.spent / project.budget) * 100}
                        className="h-2 w-[60px]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Top Clients</CardTitle>
              <CardDescription>
                Your top 5 clients by project budget
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {metrics.projects
                  .toSorted((a, b) => b.budget - a.budget)
                  .slice(0, 5)
                  .map((project) => (
                    <div className="flex items-center" key={project.id}>
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{project.client[0]}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{project.client}</p>
                        <p className="text-sm text-muted-foreground">
                          Project: {project.name}
                        </p>
                      </div>
                      <div className="ml-auto font-medium">
                        <div className="flex items-center">
                          Rs {new Intl.NumberFormat("en-PK").format(project.budget)}
                          {project.spent > project.budget ? (
                            <ArrowUpRight className="ml-1 h-4 w-4 text-red-500" />
                          ) : (
                            <ArrowDownRight className="ml-1 h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Transfers</CardTitle>
              <CardDescription>
                Your most recent transfer activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {metrics.last10DaysTransfers.slice(-5).map((transfer) => (
                  <div className="flex items-center justify-between" key={transfer.date}>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Transfer on {transfer.date}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transfer.date).toLocaleDateString('en-US', { weekday: 'long' })}
                      </p>
                    </div>
                    <div className="font-medium">
                      Rs {new Intl.NumberFormat("en-PK").format(transfer.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button>Download Report</Button>
        </div>
      </div>
      {renderContent()}
    </div>
  );
}

