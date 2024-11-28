"use client"

import { useEffect, useState } from "react"
import { getProjects, createProject } from "@/app/services/projects"
import { Project } from "@/types"
import Link from "next/link"
import ProjectModal from "../components/ProjectModal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus } from 'lucide-react'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const data = await getProjects()
      setProjects(data)
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

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Project
        </Button>
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
                <Skeleton className="h-10 w-[100px] mr-2" />
                <Skeleton className="h-10 w-[100px]" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-6">
            <p className="text-muted-foreground">No projects found. Start by adding a new project.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-1">
                  Client: {project.client}
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  Budget: Rs {project.budget}
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  Spent: Rs {project.spent}
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  Payment Transferred: Rs {project.paymentTransferred}
                </p>
                <p className="text-sm text-muted-foreground">
                  Deadline: {project.deadline || "Not set"}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button asChild variant="outline">
                  <Link href={`/dashboard/projects/${project.id}`}>
                    View Details
                  </Link>
                </Button>
                <Button variant="secondary" onClick={() => console.log("Edit project")}>
                  Edit
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleProjectAdded}
      />
    </div>
  )
}

