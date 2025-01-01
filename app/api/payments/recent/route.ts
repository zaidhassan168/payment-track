import { db } from "@/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";
import { Payment } from "@/types";

export async function GET() {
  try {
    const paymentsRef = collection(db, "payments");
    const q = query(paymentsRef, orderBy("timestamp", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    const payments: Payment[] = [];
    querySnapshot.forEach((doc) => {
      payments.push({ id: doc.id, ...doc.data() } as Payment);
    });

    const response = NextResponse.json(payments);
    response.headers.set("Access-Control-Allow-Origin", "*"); // Allow all origins
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS"); // Specify allowed methods
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Specify allowed headers
    return response;
  } catch (error) {
    console.error("Error fetching recent payments:", error);
    return NextResponse.json({ error: "Failed to fetch recent payments" }, { status: 500 });
  }
}
