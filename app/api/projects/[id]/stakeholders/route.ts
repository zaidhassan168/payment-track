import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, getDocs, query, getDoc, doc, addDoc } from "firebase/firestore";
import { Stakeholder } from "@/types";
import { Project } from "@/types";

// POST: Add a new stakeholder to a project
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id;
    const data: Stakeholder = await req.json();

    if (!data.name || !data.role || !data.contact) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const stakeholderRef = await addDoc(collection(db, `projects/${projectId}/stakeholders`), data);

    return NextResponse.json({ id: stakeholderRef.id, message: "Stakeholder added successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error adding stakeholder:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

