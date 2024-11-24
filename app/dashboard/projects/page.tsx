"use client";

import { useEffect, useState } from "react";
import { getProjects } from "@/app/services/projects";
import ProjectModal from "../components/ProjectModal";
import { Project } from "@/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (project?: Project) => {
    setSelectedProject(project || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const handleSuccess = () => {
    fetchProjects(); // Refresh the projects list
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Projects</h1>
      <button
        onClick={() => handleOpenModal()}
        className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Create New Project
      </button>
      {loading ? (
        <p>Loading projects...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow-md p-4 border hover:shadow-lg transition-shadow"
            >
              <h2 className="text-lg font-bold mb-2">{project.name}</h2>
              <p className="text-sm text-gray-600 mb-4">
                Client: {project.client} <br />
                Budget: ${project.budget} <br />
                Spent: ${project.spent} <br />
                Payment Transferred: ${project.paymentTransferred} <br />
                Deadline: {project.deadline || "Not set"}
              </p>
              <button
                onClick={() => handleOpenModal(project)}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}
      
      <ProjectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        project={selectedProject}
      />
    </div>
  );
}