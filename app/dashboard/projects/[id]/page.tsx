"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { getPaymentsByProject } from "@/app/services/payments"
import { getProjectById, updateProject } from "@/app/services/projects"
import { Payment, Project } from "@/types"
import CreatePaymentModal from "../../components/CreatePaymentModal"
import ProjectModal from "../../components/ProjectModal"
// import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Edit, Plus, DollarSign, Calendar, User, Loader } from 'lucide-react'

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
    <div className="min-h-screen bg-gray-100 p-8">
      <nav className="mb-8">
        <a
          href="/dashboard/projects"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </a>
      </nav>

      {project ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">{project.name}</h1>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors duration-200"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Project
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <User className="h-6 w-6 text-gray-500 mr-2" />
              <p className="text-gray-600">Client: <span className="font-semibold">{project.client}</span></p>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 text-gray-500 mr-2" />
              <p className="text-gray-600">Budget: <span className="font-semibold">${project.budget}</span></p>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 text-gray-500 mr-2" />
              <p className="text-gray-600">Spent: <span className="font-semibold">${project.spent}</span></p>
            </div>
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-gray-500 mr-2" />
              <p className="text-gray-600">Deadline: <span className="font-semibold">{project.deadline || "Not set"}</span></p>
            </div>
          </div>
        </motion.div>
      ) : (
        <Loader className="h-64 w-full mb-8" />
      )}

      <div className="mb-8">
        <button
          onClick={() => setIsPaymentModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Payment
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Loader key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <p className="text-gray-600 text-center">No payments found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {payments.map((payment, index) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <img
                src={payment.screenshotUrl}
                alt="Payment Screenshot"
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <p className="text-lg font-semibold mb-2">{payment.stakeholder}</p>
                <p className="text-gray-600 mb-1">Amount: ${payment.amount}</p>
                <p className="text-gray-600 text-sm">
                  {new Date(payment.timestamp).toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
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

