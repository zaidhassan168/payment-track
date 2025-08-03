import { Stakeholder } from "@/types";
import { Project } from "@/types";
import { API_URL } from "@/app/config/api";

export async function addStakeholder(projectId: string, stakeholder: Stakeholder) {
  const url = API_URL ? `${API_URL}/api/projects/${projectId}/stakeholders` : `/api/projects/${projectId}/stakeholders`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(stakeholder),
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error("Failed to add stakeholder");
  }

  return response.json();
}

export async function getProjects(): Promise<Project[]> {
  const url = API_URL ? `${API_URL}/api/projects` : "/api/projects";
  console.log('Fetching projects from:', url);
  
  const response = await fetch(url, {
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }
  return response.json();
}


// Create a New Project
export async function createProject(projectData: Project & { stakeholders: Stakeholder[] }) {
  const url = API_URL ? `${API_URL}/api/projects` : "/api/projects";
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(projectData),
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error("Failed to create project");
  }
  return response.json();
}

// Update an Existing Project
export async function updateProject(projectId: string, projectData: Project & { stakeholders: Stakeholder[] }) {
  const url = API_URL ? `${API_URL}/api/projects/${projectId}` : `/api/projects/${projectId}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(projectData),
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error("Failed to update project");
  }
  return response.json();
}


export async function getProjectById(id: string): Promise<Project> {
  const url = API_URL ? `${API_URL}/api/projects/${id}` : `/api/projects/${id}`;
  const response = await fetch(url, {
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error("Failed to fetch project");
  }
  return response.json();
}

// export async function updateProject(id: string, projectData: Project) {
//   const response = await fetch(`/api/projects/${id}`, {
//     method: "PUT",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(projectData),
//   });
//   if (!response.ok) {
//     throw new Error("Failed to update project");
//   }
//   return response.json();
// }
