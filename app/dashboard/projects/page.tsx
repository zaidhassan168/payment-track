"use client"

import { useEffect, useState } from "react"
import { getProjects } from "@/app/services/projects"
import { Project } from "@/types"
import Link from "next/link"
import ProjectModal from "../components/ProjectModal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, DollarSign, Calendar, BarChart, Users, Edit } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    setFilteredProjects(
      projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [searchTerm, projects])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const data = await getProjects()
      setProjects(data)
      setFilteredProjects(data)
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleProjectAdded = () => {
    fetchProjects()
    setIsModalOpen(false)
  }

  const ProjectCard = ({ project }: { project: Project }) => {
    const spentPercentage = (project.spent / project.budget) * 100
    return (
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span className="truncate">{project.name}</span>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/dashboard/projects/${project.id}`}>
                <BarChart className="h-4 w-4" />
                <span className="sr-only">View Details</span>
              </Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Client</span>
              <span className="font-medium">{project.client}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Budget</span>
                <span className="font-medium">PKR {new Intl.NumberFormat('en-PK').format(project.budget)}</span>
              </div>
              <Progress value={spentPercentage} className="h-2" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Spent</span>
                <span className="font-medium">PKR {new Intl.NumberFormat('en-PK').format(project.spent)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Deadline</span>
              <span className="font-medium">{project.deadline || "Not set"}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/dashboard/projects/${project.id}`}>
              View Details
            </Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage and track your ongoing projects</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Project
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Input
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Tabs defaultValue="grid" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="grid">Grid</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-4 w-[250px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-[200px] mb-2" />
                <Skeleton className="h-4 w-[150px] mb-2" />
                <Skeleton className="h-4 w-[180px] mb-2" />
                <Skeleton className="h-4 w-[160px]" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-6">
            <p className="text-muted-foreground">No projects found. Start by adding a new project.</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="grid" className="w-full">
          <TabsContent value="grid">
            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="list">
            <ScrollArea className="h-[calc(100vh-220px)]">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Client</th>
                    <th className="text-left p-2">Budget</th>
                    <th className="text-left p-2">Spent</th>
                    <th className="text-left p-2">Deadline</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="border-b">
                      <td className="p-2">{project.name}</td>
                      <td className="p-2">{project.client}</td>
                      <td className="p-2">PKR {new Intl.NumberFormat('en-PK').format(project.budget)}</td>
                      <td className="p-2">PKR {new Intl.NumberFormat('en-PK').format(project.spent)}</td>
                      <td className="p-2">{project.deadline || "Not set"}</td>
                      <td className="p-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/projects/${project.id}`}>
                            <BarChart className="h-4 w-4" />
                            <span className="sr-only">View Details</span>
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleProjectAdded}
      />
    </div>
  )
}

