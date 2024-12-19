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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Plus, Trash2 } from 'lucide-react'
import { colors } from "@/styles/colors"

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
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    if (project) {
      setFormData(project)
      setStakeholders(project.stakeholders || [])
    } else {
      setFormData({
        name: "",
        budget: 0,
        client: "",
        deadline: "",
      })
      setStakeholders([])
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

  const handleRemoveStakeholder = (index: number) => {
    const updatedStakeholders = stakeholders.filter((_, i) => i !== index)
    setStakeholders(updatedStakeholders)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { name, budget, client, deadline } = formData

    if (!name || !budget || !client) {
      alert("Name, budget, and client are required!")
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "Create Project"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Project Details</TabsTrigger>
              <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
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
                <div className="grid grid-cols-4 items-center gap-4">
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
                </div>
              </div>
            </TabsContent>
            <TabsContent value="stakeholders">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
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
                </div>
                <Button 
                  type="button" 
                  onClick={handleAddStakeholder}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stakeholder
                </Button>
              </div>

              <ScrollArea className="h-[200px] mt-4">
                {stakeholders.map((stakeholder, index) => (
                  <Card key={index} className="mb-2 relative">
                    <CardContent className="p-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => handleRemoveStakeholder(index)}
                      >
                        <Trash2 className="h-4 w-4" style={{ stroke: colors.error, strokeWidth: 2 }} />
                      </Button>
                      <p className="font-medium">{stakeholder.name}</p>
                      <p className="text-sm text-muted-foreground">{stakeholder.role}</p>
                      <p className="text-sm">{stakeholder.contact}</p>
                    </CardContent>
                  </Card>
                ))}
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
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

