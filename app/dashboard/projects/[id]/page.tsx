"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getPaymentsByProject } from "@/app/services/payments";
import { getProjectById, updateProject } from "@/app/services/projects";
import { Payment, Project } from "@/types";
import CreatePaymentModal from "../../components/CreatePaymentModal";
import ProjectModal from "../../components/ProjectModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit, Plus, DollarSign, Calendar, User, Eye, Download } from 'lucide-react';

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [project, setProject] = useState<Project | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    const unwrapParams = async () => {
      const unwrappedParams = await params;
      setProjectId(unwrappedParams.id);
      fetchProjectDetails(unwrappedParams.id);
      fetchPayments(unwrappedParams.id);
    };

    unwrapParams();
  }, [params]);

  const fetchProjectDetails = async (id: string) => {
    try {
      const projectData = await getProjectById(id);
      setProject(projectData);
    } catch (error) {
      console.error("Error fetching project details:", error);
    }
  };

  const fetchPayments = async (id: string) => {
    try {
      setLoading(true);
      const data = await getPaymentsByProject(id);
      setPayments(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentAdded = () => {
    if (projectId) {
      fetchPayments(projectId);
    }
    setIsPaymentModalOpen(false);
  };

  const handleProjectUpdated = () => {
    if (projectId) {
      fetchProjectDetails(projectId);
    }
    setIsEditModalOpen(false);
  };

  const exportToCSV = () => {
    const csvHeader = ["Date,Description,Head,Item,Category,Amount,Sent To,From,Screenshot URL"];
    const csvRows = payments.map(payment =>
      `"${payment.date}","${payment.description}","${payment.stakeholder}","${payment.item}","${payment.category}",${payment.amount},"${payment.sentTo}","${payment.from}","${payment.screenshotUrl ?? ''}"`
    );
    const csvContent = `${csvHeader.join("\n")}\n${csvRows.join("\n")}`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project?.name || "project"}_payments.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const calculateSummary = () => {
    const totalExpense = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalSent = payments.reduce((sum, payment) => payment.stakeholder === "Client Expense" ? sum + payment.amount : sum, 0);
    const totalFromClient = payments.reduce((sum, payment) => payment.stakeholder === "Income" ? sum + payment.amount : sum, 0);
    return { totalExpense, totalSent, totalFromClient };
  };

  const summary = calculateSummary();

  return (
    <div className="min-h-screen bg-background p-8">
      <nav className="mb-8">
        <Button variant="link" asChild>
          <a href="/dashboard/projects" className="inline-flex items-center text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </a>
        </Button>
      </nav>

      {project ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-3xl font-bold">{project.name}</CardTitle>
              <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Project
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center">
                  <User className="h-6 w-6 text-muted-foreground mr-2" />
                  <p className="text-sm font-medium">Client: <span className="text-foreground">{project.client}</span></p>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-6 w-6 text-muted-foreground mr-2" />
                  <p className="text-sm font-medium">Budget: <span className="text-foreground">PKR {new Intl.NumberFormat('en-PK').format(project.budget)}</span></p>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-6 w-6 text-muted-foreground mr-2" />
                  <p className="text-sm font-medium">Spent: <span className="text-foreground">PKR {new Intl.NumberFormat('en-PK').format(project.spent)}</span></p>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-6 w-6 text-muted-foreground mr-2" />
                  <p className="text-sm font-medium">Deadline: <span className="text-foreground">{project.deadline || "Not set"}</span></p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground">Total Expense</span>
                  <span className="text-2xl font-bold">PKR {new Intl.NumberFormat('en-PK').format(summary.totalExpense)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground">Total Sent</span>
                  <span className="text-2xl font-bold">PKR {new Intl.NumberFormat('en-PK').format(summary.totalSent)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground">Total From Client</span>
                  <span className="text-2xl font-bold">PKR {new Intl.NumberFormat('en-PK').format(summary.totalFromClient)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Card className="mb-8">
          <CardHeader>
            <Skeleton className="h-8 w-[250px]" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-8 flex justify-between">
        <Button onClick={() => setIsPaymentModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Payment
        </Button>
        <Button variant="secondary" onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export to CSV
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      ) : payments.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">No payments found.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Head</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Sent To</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Screenshot</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>{payment.description}</TableCell>
                    <TableCell>{payment.stakeholder}</TableCell>
                    <TableCell>{payment.item}</TableCell>
                    <TableCell>{payment.category}</TableCell>
                    <TableCell>PKR {new Intl.NumberFormat('en-PK').format(payment.amount)}</TableCell>
                    <TableCell>{payment.sentTo}</TableCell>
                    <TableCell>{payment.from}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => window.open(payment.screenshotUrl, "_blank")}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <CreatePaymentModal
        isOpen={isPaymentModalOpen}
        projectId={projectId || ""}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentAdded}
      />
      <ProjectModal
        isOpen={isEditModalOpen}
        project={project}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleProjectUpdated}
      />
    </div>
  );
}

