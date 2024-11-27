export async function getStakeholdersByProject(projectId: string) {
    const response = await fetch(`/api/projects/${projectId}/stakeholders`);
  
    if (!response.ok) {
      throw new Error("Failed to fetch stakeholders");
    }
  
    return response.json();
  }
  