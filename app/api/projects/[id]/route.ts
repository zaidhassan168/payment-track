import { NextResponse } from "next/server";
import { db } from "@/firebase"; // Firestore instance
import { doc, getDoc } from "firebase/firestore";

// GET: Retrieve a single project by ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params; // Destructure project ID from params
    const docRef = doc(db, "projects", id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ id: snapshot.id, ...snapshot.data() }, { status: 200 });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
