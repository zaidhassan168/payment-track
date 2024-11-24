import { NextResponse } from "next/server";
import { db } from "@/firebase"; // Firestore instance
import { collection, addDoc, getDocs } from "firebase/firestore";
import { Payment } from "@/types";

// POST: Create a new payment
export async function POST(req: Request) {
  try {
    const data: Payment = await req.json();
    const { projectId, stakeholder, amount, screenshotUrl } = data;

    // Validate data
    if (!projectId || !stakeholder || !amount || !screenshotUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const docRef = await addDoc(collection(db, "payments"), {
      projectId,
      stakeholder,
      amount,
      screenshotUrl,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ id: docRef.id, message: "Payment created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// GET: Retrieve all payments
export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, "payments"));
    const payments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(payments, { status: 200 });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
