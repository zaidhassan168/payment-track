import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    const { id: projectId } = context.params; // Access `params.id` asynchronously

    const paymentsQuery = query(
      collection(db, "payments"),
      where("projectId", "==", projectId)
    );
    const paymentsSnapshot = await getDocs(paymentsQuery);

    const payments = paymentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(payments, { status: 200 });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
