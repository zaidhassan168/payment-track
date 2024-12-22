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
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
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
  const renderAreaChart = (data: { date: string; amount: number }[]) => (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 10,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          vertical={false}
          stroke="hsl(var(--border) / 0.2)"
        />
        <XAxis 
          dataKey="date"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          tickLine={{ stroke: 'hsl(var(--border))' }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
        />
        <YAxis
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          tickLine={{ stroke: 'hsl(var(--border))' }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickFormatter={(value) => `Rs ${value.toLocaleString('en-PK')}`}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-muted-foreground">
                        Date
                      </span>
                      <span className="text-sm font-bold">
                        {label}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-muted-foreground">
                        Amount
                      </span>
                      <span className="text-sm font-bold">
                        Rs {payload[0]?.value?.toLocaleString('en-PK')}
                      </span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary) / 0.2)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );


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
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!metrics) {
      return (
        <div className="flex h-[400px] items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow">
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
              <p className="text-xs text-muted-foreground mt-1">
                +{((metrics.totalToday / metrics.totalMonth) * 100).toFixed(2)}% of monthly total
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
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
              <p className="text-xs text-muted-foreground mt-1">
                For {new Date().toLocaleString('default', { month: 'long' })}
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Projects
              </CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.projects.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total Budget: Rs {new Intl.NumberFormat("en-PK").format(calculateTotalBudget(metrics.projects))}
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
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
              <p className="text-xs text-muted-foreground mt-1">
                Balance: Rs {new Intl.NumberFormat("en-PK").format(calculateTotalBalance(metrics.projects))}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Last 10 Days Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] p-4">
              {renderAreaChart(metrics.last10DaysTransfers)}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>
                You have {metrics.projects.length} total projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {metrics.projects.slice(0, 5).map((project) => (
                  <div className="flex items-center" key={project.id}>
                    <Avatar className="h-10 w-10 border-2 border-background">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {project.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1 flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">
                        {project.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {project.client}
                      </p>
                    </div>
                    <div className="ml-4 w-20">
                      <Progress
                        value={(project.spent / project.budget) * 100}
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Top Clients</CardTitle>
              <CardDescription>
                Your top 5 clients by project budget
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {metrics.projects
                  .toSorted((a, b) => b.budget - a.budget)
                  .slice(0, 5)
                  .map((project) => (
                    <div className="flex items-center" key={project.id}>
                      <Avatar className="h-10 w-10 border-2 border-background">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {project.client[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1 flex-1 min-w-0">
                        <p className="text-sm font-medium leading-none truncate">
                          {project.client}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {project.name}
                        </p>
                      </div>
                      <div className="ml-4 font-medium whitespace-nowrap">
                        <div className="flex items-center">
                          Rs {new Intl.NumberFormat("en-PK").format(project.budget)}
                          {project.spent > project.budget ? (
                            <ArrowUpRight className="ml-1 h-4 w-4 text-destructive" />
                          ) : (
                            <ArrowDownRight className="ml-1 h-4 w-4 text-primary" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Recent Transfers</CardTitle>
              <CardDescription>
                Your most recent transfer activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {metrics.last10DaysTransfers.slice(-5).map((transfer) => (
                  <div className="flex items-center justify-between" key={transfer.date}>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {new Date(transfer.date).toLocaleDateString('en-US', { 
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
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
      </div>
    );
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <TrendingUp className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>
      {renderContent()}
    </div>
  );
}