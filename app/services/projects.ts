import { Stakeholder } from "@/types";
import  { Project } from "@/types";
// Add a Stakeholder to a Project
export async function addStakeholder(projectId: string, stakeholder: Stakeholder) {
  const response = await fetch(`/api/projects/${projectId}/stakeholders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(stakeholder),
  });

  if (!response.ok) {
    throw new Error("Failed to add stakeholder");
  }

  return response.json();
}


export async function getProjects(): Promise<Project[]> {
    const response = await fetch("/api/projects");
    if (!response.ok) {
      throw new Error("Failed to fetch projects");
    }
    return response.json();
  }


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