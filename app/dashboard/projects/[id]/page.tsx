"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getPaymentsByProject } from "@/app/services/payments";
import { getProjectById } from "@/app/services/projects";
import { getStakeholdersByProject } from "@/app/services/stakeholders";
import { Payment, Project, Stakeholder } from "@/types";
import CreatePaymentModal from "../../components/CreatePaymentModal";
import ProjectModal from "../../components/ProjectModal";
import EditStakeholderModal from "../../components/EditStakeHolderModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit, Plus, DollarSign, Calendar, User, Eye, Download, Pencil } from 'lucide-react';
import { TabsTrigger, Tabs, TabsContent, TabsList } from "@/components/ui/tabs";

import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title as ChartTitle } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ChartTitle);

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [project, setProject] = useState<Project | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [stakeholders, setStakeholders] = useState<Stakeholder[] | undefined>(undefined);

  const [editStakeholderModalOpen, setEditStakeholderModalOpen] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);

  useEffect(() => {
    const unwrapParams = async () => {
      const unwrappedParams = await params;
      setProjectId(unwrappedParams.id);
      
      // Fetch all required data in one go
      Promise.all([
        fetchProjectDetails(unwrappedParams.id),
        fetchPayments(unwrappedParams.id),
        fetchStakeholders(unwrappedParams.id)
      ]);
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

  const fetchStakeholders = async (id: string) => {
    try {
      const st = await getStakeholdersByProject(id);
      setStakeholders(st);
    } catch (error) {
      console.error("Error fetching stakeholders:", error);
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
      fetchProjectDetails(projectId);
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
      `"${payment.date}","${payment.description}","${payment.stakeholder.name}","${payment.item}","${payment.category}",${payment.amount},"${payment.sentTo}","${payment.from}","${payment.screenshotUrl ?? ''}"`
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

  const getSummaryData = () => {
    if (!project || !project.paymentSummary) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        expensesBreakdown: []
      };
    }

    const { paymentSummary } = project;
    const totalExpenses = paymentSummary.totalExpenses.clientExpense +
      paymentSummary.totalExpenses.projectExpense +
      paymentSummary.totalExpenses.deduction +
      paymentSummary.totalExpenses.extraExpense;

    const expensesBreakdown = [
      { name: 'Client Expense', value: paymentSummary.totalExpenses.clientExpense },
      { name: 'Project Expense', value: paymentSummary.totalExpenses.projectExpense },
      { name: 'Deduction', value: paymentSummary.totalExpenses.deduction },
      { name: 'Extra Expense', value: paymentSummary.totalExpenses.extraExpense },
    ];

    return {
      totalIncome: paymentSummary.totalIncome,
      totalExpenses,
      balance: paymentSummary.balance,
      expensesBreakdown
    };
  };

  const summary = getSummaryData();

  // Charts Data
  const expensesData = {
    labels: summary.expensesBreakdown.map(b => b.name),
    datasets: [
      {
        data: summary.expensesBreakdown.map(b => b.value),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#8A2BE2"],
      }
    ]
  };

  const incomeVsExpensesData = {
    labels: ["Income", "Expenses"],
    datasets: [
      {
        label: "Amount (PKR)",
        data: [summary.totalIncome, summary.totalExpenses],
        backgroundColor: ["#4CAF50", "#F44336"]
      }
    ]
  };

  const handleStakeholderEdit = (stakeholder: Stakeholder) => {
    setSelectedStakeholder(stakeholder);
    setEditStakeholderModalOpen(true);
  };

  const handleStakeholderUpdated = async () => {
    if (projectId) {
      await fetchStakeholders(projectId);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
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
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
              <CardTitle className="text-2xl sm:text-3xl font-bold">{project.name}</CardTitle>
              <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Project
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-muted-foreground mr-2" />
                  <p className="text-sm font-medium">Client: <span className="text-foreground">{project.client}</span></p>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-muted-foreground mr-2" />
                  <p className="text-sm font-medium">Budget: <span className="text-foreground">PKR {new Intl.NumberFormat('en-PK').format(project.budget)}</span></p>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-muted-foreground mr-2" />
                  <p className="text-sm font-medium">Spent: <span className="text-foreground">PKR {new Intl.NumberFormat('en-PK').format(project.spent)}</span></p>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                  <p className="text-sm font-medium">Deadline: <span className="text-foreground">{project.deadline || "Not set"}</span></p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="summary" className="mb-8">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
            </TabsList>
            <TabsContent value="summary">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-muted-foreground">Total Income</span>
                      <span className="text-2xl font-bold">
                        PKR {new Intl.NumberFormat('en-PK').format(summary.totalIncome)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-muted-foreground">Total Expenses</span>
                      <span className="text-2xl font-bold">
                        PKR {new Intl.NumberFormat('en-PK').format(summary.totalExpenses)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-muted-foreground">Balance</span>
                      <span className="text-2xl font-bold">
                        PKR {new Intl.NumberFormat('en-PK').format(summary.balance)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Expenses Breakdown</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                      {summary.expensesBreakdown.map((item, index) => (
                        <div key={index} className="flex flex-col">
                          <span className="text-sm font-medium text-muted-foreground">{item.name}</span>
                          <span className="text-lg font-bold">
                            PKR {new Intl.NumberFormat('en-PK').format(item.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="charts">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Expenses Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Pie data={expensesData} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Income vs Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Bar data={incomeVsExpensesData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="stakeholders">
              <Card>
                <CardHeader>
                  <CardTitle>Project Stakeholders</CardTitle>
                </CardHeader>
                <CardContent>
                  {stakeholders && stakeholders.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stakeholders.map((st) => (
                          <TableRow key={st.id}>
                            <TableCell>{st.name}</TableCell>
                            <TableCell>{st.role}</TableCell>
                            <TableCell>{st.contact}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" onClick={() => handleStakeholderEdit(st)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No stakeholders found for this project.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mb-8 flex flex-col sm:flex-row justify-between gap-4">
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
                <div className="overflow-x-auto">
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
                          <TableCell>{payment.stakeholder.name}</TableCell>
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
                </div>
              </CardContent>
            </Card>
          )}
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

      <EditStakeholderModal
        isOpen={editStakeholderModalOpen}
        projectId={projectId || ""}
        stakeholder={selectedStakeholder}
        onClose={() => setEditStakeholderModalOpen(false)}
        onSuccess={handleStakeholderUpdated}
      />
    </div>
  );
}
