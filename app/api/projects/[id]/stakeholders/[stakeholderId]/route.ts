import { db } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function PATCH( request: Request, { params }: { params: Promise<{ id: string; stakeholderId: string }> }
) {
  try {
    const updates = await request.json();
    const  projectId = (await params).id;
    const stakeholderId = (await params).stakeholderId;
    const stakeholderRef = doc(
      db,
      `projects/${projectId}/stakeholders/${stakeholderId}`
    );
    await updateDoc(stakeholderRef, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update stakeholder" }, { status: 500 });
  }
}


