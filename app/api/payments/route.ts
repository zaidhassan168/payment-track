import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Payment } from "@/types";

export async function POST(req: Request) {
  try {
    const data: Payment = await req.json();

    if (!data.projectId || !data.stakeholder || !data.amount || !data.screenshotUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const paymentRef = await addDoc(collection(db, "payments"), {
      projectId: data.projectId,
      stakeholder: data.stakeholder,
      amount: data.amount,
      screenshotUrl: data.screenshotUrl,
      timestamp: data.timestamp || new Date().toISOString(),
    });

    return NextResponse.json({ id: paymentRef.id, message: "Payment created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


// // GET: Retrieve all payments
// export async function GET() {
//   try {
//     const snapshot = await getDocs(collection(db, "payments"));
//     const payments = snapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));

//     return NextResponse.json(payments, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching payments:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }
