import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

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

