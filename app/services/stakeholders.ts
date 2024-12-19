import { db } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Stakeholder } from "@/types";

export async function updateStakeholder(projectId: string, stakeholderId: string, updates: Partial<Stakeholder>) {
  if (!projectId || !stakeholderId) {
    throw new Error('Project ID and stakeholder ID are required');
  }
  const stakeholderRef = doc(db, `projects/${projectId}/stakeholders/${stakeholderId}`);
  try {
    await updateDoc(stakeholderRef, updates);
  } catch (error) {
    throw new Error(`Failed to update stakeholder: ${error.message}`);
  }
}

export async function getStakeholdersByProject(projectId: string) {
  const response = await fetch(`/api/projects/${projectId}/stakeholders`);
  if (!response.ok) {
    throw new Error(`Failed to fetch stakeholders for project ${projectId}`);
  }
  const data = await response.json();
  return data; // This should be Stakeholder[]
}
