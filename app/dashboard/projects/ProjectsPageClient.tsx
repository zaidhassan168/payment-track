"use client";

import { useState, useEffect } from "react";
import ProjectModal from "../components/ProjectModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProjectCard from "./ProjectCard";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Project } from "@/types/index"; // Adjust the import path as necessary
export default function ProjectsPageClient({ projects }: { projects: Project[] }) {
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setFilteredProjects(
      projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, projects]);

  const handleProjectAdded = () => {
    // Optionally, you might refetch data via an API route here
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your ongoing projects
          </p>
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

      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-6">
            <p className="text-muted-foreground">
              No projects found. Start by adding a new project.
            </p>
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
        </Tabs>
      )}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleProjectAdded}
      />
    </div>
  );
}
