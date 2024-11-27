"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { getPaymentsByProject } from "@/app/services/payments"
import { getProjectById, updateProject } from "@/app/services/projects"
import { Payment, Project } from "@/types"
import CreatePaymentModal from "../../components/CreatePaymentModal"
import ProjectModal from "../../components/ProjectModal"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Plus, DollarSign, Calendar, User, Eye } from 'lucide-react'

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [project, setProject] = useState<Project | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [projectId, setProjectId] = useState<string | null>(null)

  useEffect(() => {
    const unwrapParams = async () => {
      const unwrappedParams = await params
      setProjectId(unwrappedParams.id)
      fetchProjectDetails(unwrappedParams.id)
      fetchPayments(unwrappedParams.id)
    }

    unwrapParams()
  }, [params])

  const fetchProjectDetails = async (id: string) => {
    try {
      const projectData = await getProjectById(id)
      setProject(projectData)
    } catch (error) {
      console.error("Error fetching project details:", error)
    }
  }

  const fetchPayments = async (id: string) => {
    try {
      setLoading(true)
      const data = await getPaymentsByProject(id)
      setPayments(data)
    } catch (error) {
      console.error("Error fetching payments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentAdded = () => {
    if (projectId) {
      fetchPayments(projectId)
    }
    setIsPaymentModalOpen(false)
  }

  const handleProjectUpdated = () => {
    if (projectId) {
      fetchProjectDetails(projectId)
    }
    setIsEditModalOpen(false)
  }

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
                  <p className="text-sm font-medium">Budget: <span className="text-foreground">${project.budget}</span></p>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-6 w-6 text-muted-foreground mr-2" />
                  <p className="text-sm font-medium">Spent: <span className="text-foreground">${project.spent}</span></p>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-6 w-6 text-muted-foreground mr-2" />
                  <p className="text-sm font-medium">Deadline: <span className="text-foreground">{project.deadline || "Not set"}</span></p>
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

      <div className="mb-8">
        <Button onClick={() => setIsPaymentModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Payment
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
                  <TableHead>Stakeholder</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Screenshot</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment, index) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.stakeholder}</TableCell>
                    <TableCell>${payment.amount}</TableCell>
                    <TableCell>{new Date(payment.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => window.open(payment.screenshotUrl, '_blank')}>
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
  )
}
