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
  getDocs,
} from "firebase/firestore";
import { Payment } from "@/types";
import { paymentSchema } from "@/lib/schemas/payment";
import { sendPaymentNotification } from "@/lib/notifications";
import { Stakeholder } from "@/types";


export async function POST(req: Request) {
  try {
    const json: Payment = await req.json();
    console.log("data json", json);
    const data = paymentSchema.parse(json); // Validate here
    // Validate required fie  lds
    console.log("data", data);
    if (!data.projectId || !data.amount || !data.category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Normalize category input if needed (e.g., lowercase)
    const category = data.category.toLowerCase() as
      | "income"
      | "clientexpense"
      | "projectexpense"
      | "deduction"
      | "extraexpense";

    // Validate that category is one of the allowed categories
    const allowedCategories = ["income", "clientexpense", "projectexpense", "deduction", "extraexpense"] as const;
    if (!allowedCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Add default timestamp if not provided
    const currentTimestamp = new Date().toISOString();
    data.timestamp = data.timestamp || currentTimestamp;
    data.date = data.date || currentTimestamp.split("T")[0];
    // Create a new payment entry
    // const paymentRef = await addDoc(collection(db, "payments"), {
    //   projectId: data.projectId,
    //   date: data.date,
    //   description: data.description || "",
    //   stakeholder: data.stakeholder || "",
    //   item: data.item || "",
    //   category: category,
    //   amount: data.amount,
    //   sentTo: data.sentTo || "",
    //   from: data.from || "",
    //   screenshotUrl: data.screenshotUrl || "",
    //   timestamp: data.timestamp,
    // });
    const paymentRef = await addDoc(collection(db, "payments"), data);

    // Fetch the project
    const projectRef = doc(db, "projects", data.projectId);
    const projectSnapshot = await getDoc(projectRef);

    if (!projectSnapshot.exists()) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const projectData = projectSnapshot.data();
    const currentSpent = projectData.spent || 0;
    const updatedSpent = currentSpent + data.amount;

    // Initialize paymentSummary if not present
    const currentSummary = projectData.paymentSummary || {
      totalIncome: 0,
      totalExpenses: {
        clientExpense: 0,
        projectExpense: 0,
        deduction: 0,
        extraExpense: 0,
      },
      balance: 0,
    };

    // Update summary based on the payment category
    if (category === "income") {
      currentSummary.totalIncome += data.amount;
    } else {
      // Map to the correct key in totalExpenses:
      // category: "clientexpense" -> totalExpenses.clientExpense
      // category: "projectexpense" -> totalExpenses.projectExpense
      // category: "deduction" -> totalExpenses.deduction
      // category: "extraexpense" -> totalExpenses.extraExpense

      if (category === "clientexpense") {
        currentSummary.totalExpenses.clientExpense += data.amount;
      } else if (category === "projectexpense") {
        currentSummary.totalExpenses.projectExpense += data.amount;
      } else if (category === "deduction") {
        currentSummary.totalExpenses.deduction += data.amount;
      } else if (category === "extraexpense") {
        currentSummary.totalExpenses.extraExpense += data.amount;
      }
    }

    // Recalculate the balance:
    const totalExpensesSum =
      currentSummary.totalExpenses.clientExpense +
      currentSummary.totalExpenses.projectExpense +
      currentSummary.totalExpenses.deduction +
      currentSummary.totalExpenses.extraExpense;

    currentSummary.balance = currentSummary.totalIncome - totalExpensesSum;

    // Update the project document
    await updateDoc(projectRef, {
      spent: updatedSpent,
      paymentSummary: currentSummary, // Save the updated summary
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
    // Ideally, you have a way to find the exact stakeholder document. Let's assume we have the name in `data.stakeholder`
    // and we find the first stakeholder with that name:
    // console.log("data", data);
    // if (data.stakeholder.id) {
    //   const stakeholder = data.stakeholder;
    //   // Send the WhatsApp notification
    //   try {
    //     const msgSid = await sendPaymentNotification(stakeholder, data);
    //     console.log("WhatsApp message sent, SID:", msgSid);
    //   } catch (notifyError) {
    //     console.error("Error sending WhatsApp notification:", notifyError);
    //     // Handle this error (log it, or inform the client if needed)
    //   }
    // } else {
    //   console.warn("No stakeholder found with ID:", data.stakeholder);
    // }

    return NextResponse.json({ id: paymentRef.id, message: "Payment created successfully" }, { status: 201 });

  } catch (error) {
    console.error("Error creating payment:", error);
    if (error instanceof Error && "issues" in error) {
      // ZodError
      return NextResponse.json({ error: (error as any).issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
   // here write the api to gget the daata from the firestore database of payment collection
   const payments = await getDocs(collection(db, "payments"));
   const paymentsData = payments.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
   return NextResponse.json(paymentsData, { status: 200 });}
   catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
   }
  }