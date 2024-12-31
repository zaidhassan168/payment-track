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
import { } from "@/types";
import { paymentSchema } from "@/lib/schemas/payment";
import { sendPaymentNotification } from "@/lib/notifications";
import { Stakeholder, Payment, Item } from "@/types";

export async function POST(req: Request) {
  try {
    const json: Payment = await req.json();
    console.log("data json", json);
    const data = paymentSchema.parse(json); // Validate here
    console.log("data", data);

    const validationError = validatePaymentData(data);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const category = normalizeCategory(data.category);
    const projectData = await getProjectData(data.projectId);
    if (!projectData) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    data.projectName = projectData.name || "";
    const paymentRef = await addDoc(collection(db, "payments"), data);

    const updatedSummary = updatePaymentSummary(projectData, data.amount, category);
    await updateProjectDocument(data.projectId, updatedSummary, data.amount);
    if (data.item) {
      await addItemToProject(data.item, data.projectId, data.amount);
    }
    if (data.date) {
      await updateOverviewCollection(data.date, data.projectId, projectData.name || "", data.amount); // Include projectName
      await updateMonthlyTotal(data.date, data.amount);
    }

    return NextResponse.json({ id: paymentRef.id, message: "Payment created successfully" }, { status: 201 });

  } catch (error) {
    console.error("Error creating payment:", error);
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: (error as any).issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
function validatePaymentData(data: Payment): string | null {
  if (!data.projectId || !data.amount || !data.category) {
    return "Missing required fields";
  }

  const allowedCategories = ["income", "extraIncome", "clientexpense", "projectexpense", "deduction", "extraexpense"] as const;
  if (!allowedCategories.includes(data.category.toLowerCase() as any)) {
    return "Invalid category";
  }

  return null;
}

function normalizeCategory(category: string): string {
  return category.toLowerCase() as
    | "income"
    | "extraincome"
    | "clientexpense"
    | "projectexpense"
    | "deduction"
    | "extraexpense";
}

async function getProjectData(projectId: string) {
  const projectRef = doc(db, "projects", projectId);
  const projectSnapshot = await getDoc(projectRef);
  return projectSnapshot.exists() ? projectSnapshot.data() : null;
}

function updatePaymentSummary(projectData: any, amount: number, category: string) {
  const currentSummary = projectData.paymentSummary || {

    income: 0,
    extraIncome: 0,
    totalExpenses: {
      clientExpense: 0,
      projectExpense: 0,
      deduction: 0,
      extraExpense: 0,
    },
    balance: 0,
  };

  if (category === "income") {
    currentSummary.income += amount;
  }
  else if (category === "extraincome") {
    currentSummary.extraIncome += amount;
  }
  else if (category === "clientexpense") {
    currentSummary.totalExpenses.clientExpense += amount;
  } else if (category === "projectexpense") {
    currentSummary.totalExpenses.projectExpense += amount;
  } else if (category === "deduction") {
    currentSummary.totalExpenses.deduction += amount;
  } else if (category === "extraexpense") {
    currentSummary.totalExpenses.extraExpense += amount;
  }

  const totalIncome = currentSummary.income + currentSummary.extraIncome;
  const totalExpensesSum =
    currentSummary.totalExpenses.clientExpense +
    currentSummary.totalExpenses.projectExpense +
    currentSummary.totalExpenses.deduction +
    currentSummary.totalExpenses.extraExpense;

  currentSummary.balance = totalIncome - totalExpensesSum;

  return currentSummary;
}

async function updateProjectDocument(projectId: string, summary: any, amount: number) {
  const projectRef = doc(db, "projects", projectId);
  await updateDoc(projectRef, {
    spent: increment(amount),
    paymentSummary: summary,
  });
}

async function updateOverviewCollection(date: string, projectId: string, projectName: string, amount: number) {
  const overviewRef = doc(db, "overview", date);
  const overviewSnapshot = await getDoc(overviewRef);

  const projectKey = projectId; // Use projectId directly as the key

  if (overviewSnapshot.exists()) {
    const overviewData = overviewSnapshot.data();
    const projectPayments = overviewData[projectKey] || {
      projectName: projectName, // Add projectName here if it doesn't exist
      totalTransferredToday: 0,
      totalPaymentsToday: 0,
    };

    await updateDoc(overviewRef, {
      totalTransferredToday: increment(amount),
      totalPaymentsToday: increment(1),
      [projectKey]: {
        projectName: projectName, // Ensure projectName is always updated
        totalTransferredToday: increment(amount),
        totalPaymentsToday: increment(1),
      },
    });
  } else {
    await setDoc(overviewRef, {
      date: date,
      totalTransferredToday: amount,
      totalPaymentsToday: 1,
      totalTransferredThisMonth: amount, // This might be redundant here, consider removing or adjusting
      [projectKey]: {
        projectName: projectName,
        totalTransferredToday: amount,
        totalPaymentsToday: 1,
      },
    });
  }
}

async function updateMonthlyTotal(date: string, amount: number) {
  const currentMonth = date.slice(0, 7);
  const monthlyRef = doc(db, "overview", `month-${currentMonth}`);
  const monthlySnapshot = await getDoc(monthlyRef);

  if (monthlySnapshot.exists()) {
    await updateDoc(monthlyRef, {
      totalTransferredThisMonth: increment(amount),
      totalPaymentsThisMonth: increment(1),
    });
  } else {
    await setDoc(monthlyRef, {
      month: currentMonth,
      totalTransferredThisMonth: amount,
      totalPaymentsThisMonth: 1,
    });
  }
}


async function addItemToProject(item: Item, projectId: string, totalAmount: number) {
  const projectRef = doc(db, "projects", projectId);
  item.totalAmount = totalAmount;
  //add the subcollection items in the project collection and keep adding the items in the subcollection as seprate document
  await addDoc(collection(projectRef, "items"), item);

}

export async function GET(request: Request) {
  try {
    // here write the api to gget the daata from the firestore database of payment collection
    const payments = await getDocs(collection(db, "payments"));
    const paymentsData = payments.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(paymentsData, { status: 200 });
  }
  catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
