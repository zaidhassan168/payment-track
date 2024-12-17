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

ChartJS.register(ArcElement, Tooltip, Legend)

const itemsPerPage = 10

export default function AllPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [projectFilter, setProjectFilter] = useState("")
  const [stakeholderFilter, setStakeholderFilter] = useState("")
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

  const uniqueProjects = Array.from(new Set(payments.map((p) => p.projectName)));
  const uniqueStakeholders = Array.from(new Set(payments.map((p) => p.stakeholder?.name)));

  const filteredPayments = payments.filter(payment =>
    payment.stakeholder?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (payment.projectName && payment.projectName.toLowerCase().includes(searchTerm.toLowerCase()))
  ).filter(payment =>
    projectFilter ? payment.projectName === projectFilter : true
  ).filter(payment =>
    stakeholderFilter ? payment.stakeholder.name === stakeholderFilter : true
  )

  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage)

  const stakeholderSummary = filteredPayments.reduce((acc, payment) => {
    acc[payment.stakeholder.name] = (acc[payment.stakeholder.name] || 0) + payment.amount
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

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Payments by Stakeholder',
      },
    },
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
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
    <div className="container mx-auto p-8 space-y-8 bg-[#F8F9FA] min-h-screen">
      <h1 className="text-4xl font-bold text-primary mb-6">All Payments</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-8 p-6 bg-white rounded-lg shadow-sm">
        <Input
          placeholder="Search by stakeholder or project"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:w-1/3"
        />
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="md:w-1/3">
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent>
  <SelectItem value="all">All Projects</SelectItem>
  {uniqueProjects.map((project, index) => (
    <SelectItem key={`${project}-${index}`} value={project || "unknown"}>
      {project || "Unknown"}
    </SelectItem>
  ))}
</SelectContent>

<SelectContent>
  <SelectItem value="all">All Stakeholders</SelectItem>
  {uniqueStakeholders.map((stakeholder, index) => (
    <SelectItem key={`${stakeholder}-${index}`} value={stakeholder || "unknown"}>
      {stakeholder || "Unknown"}
    </SelectItem>
  ))}
</SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="table" className="bg-white rounded-lg shadow-sm p-6">
        <TabsList className="mb-4">
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="summary">Summary View</TabsTrigger>
          <TabsTrigger value="chart">Chart View</TabsTrigger>
        </TabsList>
        <TabsContent value="table">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Project</TableHead>
                  <TableHead className="font-bold">Stakeholder</TableHead>
                  <TableHead className="font-bold">Amount</TableHead>
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="font-bold">Screenshot</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPayments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.projectName}</TableCell>
                    <TableCell>{p.stakeholder?.name || "Unknown"}</TableCell>
                    <TableCell className="font-semibold">${p.amount.toLocaleString()}</TableCell>
                    <TableCell>{p.timestamp ? new Date(p.timestamp).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      {p.screenshotUrl && (
                        <a href={p.screenshotUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View
                        </a>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stakeholderSummary).map(([name, total]) => (
              <Card key={name} className="bg-secondary/10">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">${total.toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="chart">
          <div className="h-[400px] w-full">
            <Pie data={chartData} options={{
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
            }} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}




//  const uniqueProjects = Array.from(new Set(payments.map((p) => p.projectName)));
//const uniqueStakeholders = Array.from(new Set(payments.map((p) => p.stakeholder?.name)));
