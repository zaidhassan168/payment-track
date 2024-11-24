import { Project, Stakeholder } from "@/types";

// Create a New Project
export async function createProject(projectData: Project & { stakeholders: Stakeholder[] }) {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    throw new Error("Failed to create project");
  }

  return response.json();
}

// Update an Existing Project
export async function updateProject(projectId: string, projectData: Project & { stakeholders: Stakeholder[] }) {
  const response = await fetch(`/api/projects/${projectId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    throw new Error("Failed to update project");
  }

  return response.json();
}
