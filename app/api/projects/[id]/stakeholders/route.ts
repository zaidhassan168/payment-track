import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await context.params;

    const stakeholdersRef = collection(db, `projects/${projectId}/stakeholders`);
    const stakeholdersSnapshot = await getDocs(stakeholdersRef);

    const stakeholders = stakeholdersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(stakeholders, { status: 200 });
  } catch (error) {
    console.error("Error fetching stakeholders:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await context.params;
  const stakeholderData = await request.json();

  try {
    const stakeholdersRef = collection(db, `projects/${projectId}/stakeholders`);
    const newStakeholderRef = await addDoc(stakeholdersRef, stakeholderData);
    return NextResponse.json({ id: newStakeholderRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error adding stakeholder:', error);
    return NextResponse.json({ error: 'Failed to add stakeholder' }, { status: 500 });
  }
}

