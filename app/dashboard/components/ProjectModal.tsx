"use client"

import { useState, useEffect } from "react"
import { Project, Stakeholder } from "@/types"
import { createProject, updateProject } from "@/app/services/projects"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  project?: Project
}

export default function ProjectModal({ isOpen, onClose, onSuccess, project }: ProjectModalProps) {
  const [formData, setFormData] = useState<Partial<Project>>({
    name: "",
    budget: 0,
    client: "",
    deadline: "",
  })
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([])
  const [newStakeholder, setNewStakeholder] = useState<Stakeholder>({ name: "", role: "", contact: "" })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (project) {
      setFormData(project)
      setStakeholders(project.stakeholders || [])
    }
  }, [project])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAddStakeholder = () => {
    if (newStakeholder.name && newStakeholder.role && newStakeholder.contact) {
      setStakeholders([...stakeholders, newStakeholder])
      setNewStakeholder({ name: "", role: "", contact: "" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { name, budget, client, deadline } = formData

    if (!name?.trim()) {
      toast.error("Project name is required")
      return
    }
    if (!client?.trim()) {
      toast.error("Client name is required")
      return
    }
    const budgetNum = Number(budget)
    if (!budget || isNaN(budgetNum) || budgetNum <= 0) {
      toast.error("Please enter a valid budget amount")
      return
    }

    setLoading(true)

    try {
      const projectData: Project & { stakeholders: Stakeholder[] } = {
        id: project?.id || '',
        name,
        budget: Number(budget),
        client,
        deadline,
        spent: project?.spent || 0,
        paymentTransferred: project?.paymentTransferred || 0,
        stakeholders: stakeholders || [],
      }

      if (project?.id) {
        console.log("Updating project:", projectData)
        await updateProject(project.id, projectData)
      } else {
        await createProject(projectData)
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error saving project:", error)
      alert("An error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "Create Project"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budget" className="text-right">
                Budget
              </Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                value={formData.budget}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client" className="text-right">
                Client
              </Label>
              <Input
                id="client"
                name="client"
                value={formData.client}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            {/* <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deadline" className="text-right">
                Deadline
              </Label>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleChange}
                className="col-span-3"
              />
            </div> */}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Stakeholders</h3>
            <div className="grid gap-2">
              <Input
                placeholder="Name"
                value={newStakeholder.name}
                onChange={(e) => setNewStakeholder({ ...newStakeholder, name: e.target.value })}
              />
              <Input
                placeholder="Role"
                value={newStakeholder.role}
                onChange={(e) => setNewStakeholder({ ...newStakeholder, role: e.target.value })}
              />
              <Input
                placeholder="Contact"
                value={newStakeholder.contact}
                onChange={(e) => setNewStakeholder({ ...newStakeholder, contact: e.target.value })}
              />
              <Button type="button" onClick={handleAddStakeholder}>
                Add Stakeholder
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[200px] mt-4">
            {stakeholders.map((stakeholder, index) => (
              <Card key={index} className="mb-2">
                <CardContent className="p-4">
                  <p className="font-medium">{stakeholder.name}</p>
                  <p className="text-sm text-muted-foreground">{stakeholder.role}</p>
                  <p className="text-sm">{stakeholder.contact}</p>
                </CardContent>
              </Card>
            ))}
          </ScrollArea>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
