"use client";

import { useEffect, useState } from "react";
import { getOverviewMetrics } from "@/app/services/overview";
import { getRecentPayments } from "@/app/services/payments";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ProjectTransfersAreaChart } from "./components/ProjectTransfersAreaChart";
import { RenderPaymentsContent } from "./components/RenderPaymentsContent";
import { Project, Metrics, DayTransfer, ProjectTransfer, Payment } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoadingOverview(true);
      try {
        const metricsData = await getOverviewMetrics();
        console.log("Overview metrics:", metricsData);
        setMetrics(metricsData);
      } catch (error) {
        console.error("Error fetching overview metrics:", error);
      } finally {
        setLoadingOverview(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchPaymentsData = async () => {
      setLoadingPayments(true);
      try {
        const paymentsData = await getRecentPayments();
        console.log("Recent payments:", paymentsData);
        setRecentPayments(paymentsData);
      } catch (error) {
        console.error("Error fetching recent payments:", error);
      } finally {
        setLoadingPayments(false);
      }
    };

    fetchPaymentsData();
  }, []);

  const calculateTotalBudget = (projects: Project[]) => {
    return projects.reduce((total, project) => total + project.budget, 0);
  };

  const calculateTotalSpent = (projects: Project[]) => {
    return projects.reduce((total, project) => total + project.spent, 0);
  };

  const calculateTotalBalance = (projects: Project[]) => {
    return projects.reduce((total, project) => total + (project.paymentSummary?.balance ?? 0), 0);
  };

  const renderContent = () => {
    if (loadingOverview) {
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
              <CardTitle>Project Transfers</CardTitle>
              <CardDescription>
                Transfer trends across all projects
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ProjectTransfersAreaChart data={metrics.last10DaysTransfers} />
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
          <Card className="col-span-4 hover:shadow-md transition-shadow h-[400px]">
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>Your most recent payment activities</CardDescription>
            </CardHeader>
            <CardContent className="overflow-hidden">
              <RenderPaymentsContent loadingPayments={loadingPayments} recentPayments={recentPayments} />
            </CardContent>
          </Card>

          <Card className="col-span-3 hover:shadow-md transition-shadow h-[400px]">
            <CardHeader>
              <CardTitle>Recent Transfers</CardTitle>
              <CardDescription>
                Your most recent transfer activities
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-hidden">
              <ScrollArea className="h-[300px] w-full">
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
                        Rs {new Intl.NumberFormat("en-PK").format(transfer.totalAmount)}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
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
