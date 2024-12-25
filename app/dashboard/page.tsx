"use client";

import { useEffect, useState } from "react";
import { getOverviewMetrics } from "@/app/services/overview";
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
import { Project, Metrics, DayTransfer, ProjectTransfer } from "@/types";


export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getOverviewMetrics();
        console.log("Overview metrics:", data);
        setMetrics(data);
      } catch (error) {
        console.error("Error fetching overview metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
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
                      Rs {new Intl.NumberFormat("en-PK").format(transfer.totalAmount)}
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