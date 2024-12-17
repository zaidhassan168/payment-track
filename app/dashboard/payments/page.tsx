"use client"

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Payment } from "@/types"
import { getPayments } from "@/app/services/payments"
import { Loader2 } from 'lucide-react'
import { colors, chartColors } from '@/styles/colors';
import { Search, Filter, TableIcon, BarChart, PieChart } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend)

const itemsPerPage = 10

export default function AllPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [projectFilter, setProjectFilter] = useState("all")
  const [stakeholderFilter, setStakeholderFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    async function fetchPayments() {
      try {
        const fetchedPayments = await getPayments()
        setPayments(fetchedPayments)
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch payments. Please try again later.")
        setLoading(false)
      }
    }
    fetchPayments()
  }, [])

  const uniqueProjects = Array.from(new Set(payments.map((p) => p.projectName).filter(Boolean)))
  const uniqueStakeholders = Array.from(new Set(payments.map((p) => p.stakeholder?.name).filter(Boolean)))

  const filteredPayments = payments
    .filter(payment => {
      const term = searchTerm.toLowerCase()
      const matchesStakeholder = payment.stakeholder?.name?.toLowerCase()?.includes(term)
      const matchesProject = payment.projectName?.toLowerCase()?.includes(term)
      return matchesStakeholder || matchesProject
    })
    .filter(payment => projectFilter === "all" || payment.projectName === projectFilter)
    .filter(payment => stakeholderFilter === "all" || payment.stakeholder?.name === stakeholderFilter)

  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage)

  const stakeholderSummary = filteredPayments.reduce((acc, payment) => {
    const name = payment.stakeholder?.name || "Unknown"
    acc[name] = (acc[name] || 0) + payment.amount
    return acc
  }, {} as Record<string, number>)

  const chartData = {
    labels: Object.keys(stakeholderSummary),
    datasets: [
      {
        data: Object.values(stakeholderSummary),
        backgroundColor: chartColors,
      },
    ],
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8 min-h-screen bg-[#F8F9FA]">
      <h1 className="text-4xl font-bold text-primary mb-8">All Payments</h1>

      {/* Filters Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 p-6 bg-white rounded-md shadow-md">
        <div className="relative md:w-1/3">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
            style={{ stroke: colors.mutedForeground, fill: "none", strokeWidth: 1.5 }}
          />
          <Input
            placeholder="Search by stakeholder or project"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="md:w-1/3">
            <Filter
              className="mr-2 h-5 w-5"
              style={{ stroke: colors.primary, fill: "none", strokeWidth: 1.5 }}
            />
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {uniqueProjects.map((project, index) => (
              <SelectItem key={`${project}-${index}`} value={project || ''}>
                {project}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stakeholderFilter} onValueChange={setStakeholderFilter}>
          <SelectTrigger className="md:w-1/3">
            <Filter
              className="mr-2 h-5 w-5"
              style={{ stroke: colors.secondary, fill: "none", strokeWidth: 1.5 }}
            />
            <SelectValue placeholder="Filter by stakeholder" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stakeholders</SelectItem>
            {uniqueStakeholders.map((stakeholder, index) => (
              <SelectItem key={`${stakeholder}-${index}`} value={stakeholder}>
                {stakeholder}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="table" className="bg-white rounded-md shadow-md p-6">
        <TabsList className="mb-4 flex gap-2">
          <TabsTrigger value="table" className="flex items-center gap-2">
            <TableIcon
              className="h-5 w-5"
              style={{ stroke: colors.primary, fill: "none", strokeWidth: 1.5 }}
            />
            Table View
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <BarChart
              className="h-5 w-5"
              style={{ stroke: colors.secondary, fill: "none", strokeWidth: 1.5 }}
            />
            Summary View
          </TabsTrigger>
          <TabsTrigger value="chart" className="flex items-center gap-2">
            <PieChart
              className="h-5 w-5"
              style={{ stroke: colors.accent, fill: "none", strokeWidth: 1.5 }}
            />
            Chart View
          </TabsTrigger>
        </TabsList>

        {/* Table View */}
        <TabsContent value="table">
          <div className="overflow-x-auto rounded-md shadow-inner">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold bg-gray-50">Project</TableHead>
                  <TableHead className="font-bold bg-gray-50">Stakeholder</TableHead>
                  <TableHead className="font-bold bg-gray-50">Amount</TableHead>
                  <TableHead className="font-bold bg-gray-50">Date</TableHead>
                  <TableHead className="font-bold bg-gray-50">Screenshot</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPayments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.projectName || "Unknown"}</TableCell>
                    <TableCell>{p.stakeholder?.name || "Unknown"}</TableCell>
                    <TableCell className="font-semibold">PKR {p.amount.toLocaleString()}</TableCell>
                    <TableCell>{p.timestamp ? new Date(p.timestamp).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      {p.screenshotUrl && (
                        <a
                          href={p.screenshotUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </a>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="transition-colors hover:bg-primary hover:text-white"
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="transition-colors hover:bg-primary hover:text-white"
            >
              Next
            </Button>
          </div>
        </TabsContent>

        {/* Summary View */}
        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stakeholderSummary).map(([name, total]) => (
              <Card key={name} className="bg-secondary/10 rounded-md shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">PKR {total.toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Chart View */}
        <TabsContent value="chart">
          <div className="h-[400px] w-full flex items-center justify-center">
            <Pie
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: 'Payments by Stakeholder',
                    font: {
                      size: 16,
                      weight: 'bold',
                    },
                  },
                },
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
