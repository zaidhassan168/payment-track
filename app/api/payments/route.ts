import { NextResponse } from "next/server";
import { db } from "@/firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  increment,
} from "firebase/firestore";
import { Payment } from "@/types";

export async function POST(req: Request) {
  try {
    const data: Payment = await req.json();

    // Validate required fields
    if (!data.projectId || !data.amount || !data.category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Add default timestamp if not provided
    const currentTimestamp = new Date().toISOString();
    data.timestamp = data.timestamp || currentTimestamp;
    data.date = data.date || currentTimestamp.split("T")[0]; // Default to today (YYYY-MM-DD)

    // Create a new payment entry
    const paymentRef = await addDoc(collection(db, "payments"), {
      projectId: data.projectId,
      date: data.date,
      description: data.description || "",
      stakeholder: data.stakeholder || "",
      item: data.item || "",
      category: data.category,
      amount: data.amount,
      sentTo: data.sentTo || "",
      from: data.from || "",
      screenshotUrl: data.screenshotUrl || "",
      timestamp: data.timestamp,
    });

    // Update the project's spent amount
    const projectRef = doc(db, "projects", data.projectId);
    const projectSnapshot = await getDoc(projectRef);

    if (!projectSnapshot.exists()) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const currentSpent = projectSnapshot.data().spent || 0;
    await updateDoc(projectRef, {
      spent: currentSpent + data.amount,
    });

    // Update the overview collection
    const today = data.date;
    const overviewRef = doc(db, "overview", today);
    const overviewSnapshot = await getDoc(overviewRef);

    if (overviewSnapshot.exists()) {
      // If today's entry exists, increment the amount
      await updateDoc(overviewRef, {
        totalTransferredToday: increment(data.amount),
        totalPaymentsToday: increment(1),
      });
    } else {
      // If today's entry does not exist, create a new document
      await setDoc(overviewRef, {
        date: today,
        totalTransferredToday: data.amount,
        totalPaymentsToday: 1,
        totalTransferredThisMonth: data.amount, // Start with today's amount for the month
      });
    }

    // Update monthly total
    const currentMonth = today.slice(0, 7); // YYYY-MM format
    const monthlyRef = doc(db, "overview", `month-${currentMonth}`);
    const monthlySnapshot = await getDoc(monthlyRef);

    if (monthlySnapshot.exists()) {
      await updateDoc(monthlyRef, {
        totalTransferredThisMonth: increment(data.amount),
        totalPaymentsThisMonth: increment(1),
      });
    } else {
      await setDoc(monthlyRef, {
        month: currentMonth,
        totalTransferredThisMonth: data.amount,
        totalPaymentsThisMonth: 1,
      });
    }

    return NextResponse.json({
      id: paymentRef.id,
      message: "Payment created, project updated, and overview updated successfully",
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
