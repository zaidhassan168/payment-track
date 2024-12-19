import { db } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Stakeholder } from "@/types";

export async function updateStakeholder(projectId: string, stakeholderId: string, updates: Partial<Stakeholder>) {
  const stakeholderRef = doc(db, `projects/${projectId}/stakeholders/${stakeholderId}`);
  await updateDoc(stakeholderRef, updates);
}

export async function getStakeholdersByProject(projectId: string) {
  const response = await fetch(`/api/projects/${projectId}/stakeholders`);
  if (!response.ok) {
    throw new Error(`Failed to fetch stakeholders for project ${projectId}`);
  }
  const data = await response.json();
  return data; // This should be Stakeholder[]
}
