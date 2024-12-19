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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TabsTrigger, Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Plus, DollarSign, Calendar, User, Eye, Download, Pencil, ChevronRight } from 'lucide-react';
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

  const expensesData = {
    labels: summary.expensesBreakdown.map(b => b.name),
    datasets: [
      {
        data: summary.expensesBreakdown.map(b => b.value),
        backgroundColor: ["#94a3b8", "#64748b", "#475569", "#334155"],
        borderColor: "#f8fafc",
        borderWidth: 2,
      }
    ]
  };

  const incomeVsExpensesData = {
    labels: ["Income", "Expenses"],
    datasets: [
      {
        label: "Amount (PKR)",
        data: [summary.totalIncome, summary.totalExpenses],
        backgroundColor: ["#22c55e", "#ef4444"]
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4 md:p-8">
      <nav className="mb-8">
        <Button variant="ghost" asChild className="hover:bg-slate-200 transition-colors">
          <a href="/dashboard/projects" className="inline-flex items-center text-slate-700">
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
          <Card className="mb-8 bg-white shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
              <div>
                <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-800">{project.name}</CardTitle>
                <CardDescription className="text-slate-500">{project.client}</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setIsEditModalOpen(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-700">
                <Edit className="mr-2 h-4 w-4" />
                Edit Project
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card className="bg-slate-50">
                  <CardContent className="flex items-center p-4">
                    <User className="h-5 w-5 text-slate-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-slate-500">Client</p>
                      <p className="text-lg font-semibold text-slate-700">{project.client}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50">
                  <CardContent className="flex items-center p-4">
                    <DollarSign className="h-5 w-5 text-slate-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-slate-500">Budget</p>
                      <p className="text-lg font-semibold text-slate-700">PKR {new Intl.NumberFormat('en-PK').format(project.budget)}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50">
                  <CardContent className="flex items-center p-4">
                    <DollarSign className="h-5 w-5 text-slate-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-slate-500">Spent</p>
                      <p className="text-lg font-semibold text-slate-700">PKR {new Intl.NumberFormat('en-PK').format(project.spent)}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50">
                  <CardContent className="flex items-center p-4">
                    <Calendar className="h-5 w-5 text-slate-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-slate-500">Deadline</p>
                      <p className="text-lg font-semibold text-slate-700">{project.deadline || "Not set"}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="summary" className="mb-8">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 bg-slate-100 p-1 rounded-lg">
              <TabsTrigger value="summary" className="data-[state=active]:bg-white">Summary</TabsTrigger>
              <TabsTrigger value="charts" className="data-[state=active]:bg-white">Charts</TabsTrigger>
              <TabsTrigger value="stakeholders" className="data-[state=active]:bg-white">Stakeholders</TabsTrigger>
            </TabsList>
            <TabsContent value="summary">
              <Card className="bg-white shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-emerald-50">
                      <CardContent className="p-4">
                        <p className="text-sm font-medium text-emerald-600">Total Income</p>
                        <p className="text-2xl font-bold text-emerald-700">
                          PKR {new Intl.NumberFormat('en-PK').format(summary.totalIncome)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-red-50">
                      <CardContent className="p-4">
                        <p className="text-sm font-medium text-red-600">Total Expenses</p>
                        <p className="text-2xl font-bold text-red-700">
                          PKR {new Intl.NumberFormat('en-PK').format(summary.totalExpenses)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-blue-50">
                      <CardContent className="p-4">
                        <p className="text-sm font-medium text-blue-600">Balance</p>
                        <p className="text-2xl font-bold text-blue-700">
                          PKR {new Intl.NumberFormat('en-PK').format(summary.balance)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-slate-700">Expenses Breakdown</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                      {summary.expensesBreakdown.map((item, index) => (
                        <Card key={index} className="bg-slate-50">
                          <CardContent className="p-4">
                            <p className="text-sm font-medium text-slate-500">{item.name}</p>
                            <p className="text-lg font-bold text-slate-700">
                              PKR {new Intl.NumberFormat('en-PK').format(item.value)}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="charts">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-white shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl text-slate-800">Expenses Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Pie data={expensesData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </CardContent>
                </Card>
                <Card className="bg-white shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl text-slate-800">Income vs Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Bar data={incomeVsExpensesData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="stakeholders">
              <Card className="bg-white shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800">Project Stakeholders</CardTitle>
                </CardHeader>
                <CardContent>
                  {stakeholders && stakeholders.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-slate-600">Name</TableHead>
                          <TableHead className="text-slate-600">Role</TableHead>
                          <TableHead className="text-slate-600">Contact</TableHead>
                          <TableHead className="text-slate-600">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stakeholders.map((st) => (
                          <TableRow key={st.id}>
                            <TableCell className="font-medium text-slate-700">{st.name}</TableCell>
                            <TableCell className="text-slate-600">{st.role}</TableCell>
                            <TableCell className="text-slate-600">{st.contact}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" onClick={() => handleStakeholderEdit(st)} className="bg-slate-100 hover:bg-slate-200 text-slate-700">
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-slate-500 py-8">No stakeholders found for this project.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mb-8 flex flex-col sm:flex-row justify-between gap-4">
            <Button onClick={() => setIsPaymentModalOpen(true)} className=" text-white">
              <Plus className="mr-2 h-4 w-4" />
              Create Payment
            </Button>
            <Button variant="outline" onClick={exportToCSV} className="bg-slate-100 hover:bg-slate-200 text-slate-700">
              <Download className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
          </div>

          {loading ? (
            <Card className="bg-white shadow-md">
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ) : payments.length === 0 ? (
            <Card className="bg-white shadow-md">
              <CardContent>
                <p className="text-center text-slate-500 py-8">No payments found.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-slate-600">Date</TableHead>
                        <TableHead className="text-slate-600">Description</TableHead>
                        <TableHead className="text-slate-600">Head</TableHead>
                        <TableHead className="text-slate-600">Item</TableHead>
                        <TableHead className="text-slate-600">Category</TableHead>
                        <TableHead className="text-slate-600">Amount</TableHead>
                        <TableHead className="text-slate-600">Sent To</TableHead>
                        <TableHead className="text-slate-600">From</TableHead>
                        <TableHead className="text-slate-600">Screenshot</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="text-slate-700">{payment.date}</TableCell>
                          <TableCell className="text-slate-700">{payment.description}</TableCell>
                          <TableCell className="text-slate-700">{payment.stakeholder.name}</TableCell>
                          <TableCell className="text-slate-700">{payment.item}</TableCell>
                          <TableCell className="text-slate-700">{payment.category}</TableCell>
                          <TableCell className="text-slate-700 font-medium">PKR {new Intl.NumberFormat('en-PK').format(payment.amount)}</TableCell>
                          <TableCell className="text-slate-700">{payment.sentTo}</TableCell>
                          <TableCell className="text-slate-700">{payment.from}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => window.open(payment.screenshotUrl, "_blank")} className="bg-slate-100 hover:bg-slate-200 text-slate-700">
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
        <Card className="mb-8 bg-white shadow-md">
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
