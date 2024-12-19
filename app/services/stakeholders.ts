import { db } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Stakeholder } from "@/types";

export async function updateStakeholder(projectId: string, stakeholderId: string, updates: Partial<Stakeholder>) {
  const response = await fetch(`/api/projects/${projectId}/stakeholders/${stakeholderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update stakeholder');
  }

  return response.json();
}
export async function getStakeholdersByProject(projectId: string) {
  const response = await fetch(`/api/projects/${projectId}/stakeholders`);
  if (!response.ok) {
    throw new Error(`Failed to fetch stakeholders for project ${projectId}`);
  }
  const data = await response.json();
  return data; // This should be Stakeholder[]
}


export const addStakeholder = async (projectId: string, stakeholder: Stakeholder): Promise<string> => {
  const response = await fetch(`/api/projects/${projectId}/stakeholders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(stakeholder),
  });

  if (!response.ok) {
    throw new Error('Failed to add stakeholder');
  }

  const data = await response.json();
  return data.id;
};