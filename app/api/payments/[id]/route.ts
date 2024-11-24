import { NextResponse } from "next/server";
import { db } from "@/firebase"; // Firestore instance
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

// GET: Retrieve a single payment by ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const docRef = doc(db, "payments", id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({ id: snapshot.id, ...snapshot.data() }, { status: 200 });
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update a payment by ID
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const data = await req.json();
    const docRef = doc(db, "payments", id);

    await updateDoc(docRef, data);

    return NextResponse.json({ message: "Payment updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Remove a payment by ID
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const docRef = doc(db, "payments", id);

    await deleteDoc(docRef);

    return NextResponse.json({ message: "Payment deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting payment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
