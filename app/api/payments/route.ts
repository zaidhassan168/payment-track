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
// import { sendPaymentNotification } from "@/lib/notifications"; // If needed

/***********************
 *  SAFE COERCION HELPERS
 ***********************/
function safeNumber(val: unknown): number {
  return typeof val === "number" && !isNaN(val) ? val : 0;
}

export async function POST(req: Request) {
  try {
    // Validate incoming data with Zod (ensures 'amount' is a number)
    const json: Payment = await req.json();
    const data = paymentSchema.parse(json);

    // DEBUG: Check that 'amount' is indeed a number
    console.log("Incoming amount:", data.amount, "Type:", typeof data.amount);

    const validationError = validatePaymentData(data);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const category = normalizeCategory(data.category);

    // 1. Get the project data
    const projectData = await getProjectData(data.projectId);
    if (!projectData) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // 2. Set projectName on data for reference
    data.projectName = projectData.name || "";

    // 3. Add a new payment document
    const paymentRef = await addDoc(collection(db, "payments"), data);

    // 4. Update the project’s payment summary and spent amount
    const updatedSummary = updatePaymentSummary(projectData, data.amount, category);
    await updateProjectDocument(data.projectId, updatedSummary, data.amount);

    // 5. Optionally handle 'date' (update overview documents)
    if (data.date) {
      await updateOverviewCollection(data.date, data.projectId, projectData.name || "", data.amount);
      await updateMonthlyTotal(data.date, data.amount);
    }

    return NextResponse.json(
      { id: paymentRef.id, message: "Payment created successfully" },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating payment:", error);

    // If it's a Zod validation error:
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: (error as any).issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/***********************
 *  DATA VALIDATION & NORMALIZATION
 ***********************/
function validatePaymentData(data: Payment): string | null {
  if (!data.projectId || !data.amount || !data.category) {
    return "Missing required fields";
  }

  // Must match normalized categories
  const allowedCategories = [
    "income",
    "extraincome",
    "clientexpense",
    "projectexpense",
    "deduction",
    "extraexpense",
  ] as const;

  if (!allowedCategories.includes(data.category.toLowerCase() as any)) {
    return "Invalid category";
  }

  return null;
}

function normalizeCategory(category: string): Payment["category"] {
  return category.toLowerCase() as Payment["category"];
}

/***********************
 *  PROJECT DATA
 ***********************/
async function getProjectData(projectId: string) {
  const projectRef = doc(db, "projects", projectId);
  const projectSnapshot = await getDoc(projectRef);
  return projectSnapshot.exists() ? projectSnapshot.data() : null;
}

/***********************
 *  PAYMENT SUMMARY UPDATER
 ***********************/
function updatePaymentSummary(projectData: any, amount: number, category: string) {
  // Safely parse existing summary fields as numbers
  const currentSummary = {
    income: safeNumber(projectData.paymentSummary?.income),
    extraIncome: safeNumber(projectData.paymentSummary?.extraIncome),
    totalExpenses: {
      clientExpense: safeNumber(projectData.paymentSummary?.totalExpenses?.clientExpense),
      projectExpense: safeNumber(projectData.paymentSummary?.totalExpenses?.projectExpense),
      deduction: safeNumber(projectData.paymentSummary?.totalExpenses?.deduction),
      extraExpense: safeNumber(projectData.paymentSummary?.totalExpenses?.extraExpense),
    },
    balance: safeNumber(projectData.paymentSummary?.balance),
  };

  // Update the fields based on category
  switch (category) {
    case "income":
      currentSummary.income += amount;
      break;
    case "extraincome":
      currentSummary.extraIncome += amount;
      break;
    case "clientexpense":
      currentSummary.totalExpenses.clientExpense += amount;
      break;
    case "projectexpense":
      currentSummary.totalExpenses.projectExpense += amount;
      break;
    case "deduction":
      currentSummary.totalExpenses.deduction += amount;
      break;
    case "extraexpense":
      currentSummary.totalExpenses.extraExpense += amount;
      break;
    default:
      // Shouldn't happen if we validated properly
      break;
  }

  // Recompute balance
  const totalIncome = currentSummary.income + currentSummary.extraIncome;
  const totalExpensesSum =
    currentSummary.totalExpenses.clientExpense +
    currentSummary.totalExpenses.projectExpense +
    currentSummary.totalExpenses.deduction +
    currentSummary.totalExpenses.extraExpense;

  currentSummary.balance = totalIncome - totalExpensesSum;

  return currentSummary;
}

/***********************
 *  UPDATE PROJECT DOCUMENT
 ***********************/
async function updateProjectDocument(projectId: string, summary: any, amount: number) {
  const projectRef = doc(db, "projects", projectId);

  // We assume 'spent' is numeric in Firestore. If it's missing, Firestore sets it to 0 before increment
  await updateDoc(projectRef, {
    spent: increment(amount),
    paymentSummary: summary,
  });
}

/***********************
 *  UPDATE DAILY OVERVIEW
 ***********************/
async function updateOverviewCollection(date: string, projectId: string, projectName: string, amount: number) {
  const overviewRef = doc(db, "overview", date);
  const overviewSnapshot = await getDoc(overviewRef);

  if (overviewSnapshot.exists()) {
    // Existing doc
    await updateDoc(overviewRef, {
      totalTransferredToday: increment(amount),
      totalPaymentsToday: increment(1),
      [projectId]: {
        projectName: projectName,
        totalTransferredToday: increment(amount),
        totalPaymentsToday: increment(1),
      },
    });
  } else {
    // Create new doc
    await setDoc(overviewRef, {
      date: date,
      totalTransferredToday: amount,
      totalPaymentsToday: 1,
      totalTransferredThisMonth: amount,
      [projectId]: {
        projectName: projectName,
        totalTransferredToday: amount,
        totalPaymentsToday: 1,
      },
    });
  }
}

/***********************
 *  UPDATE MONTHLY TOTAL
 ***********************/
async function updateMonthlyTotal(date: string, amount: number) {
  // 'YYYY-MM' from 'YYYY-MM-DD'
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

/***********************
 *  OPTIONAL: ADD ITEM TO PROJECT
 ***********************/
// If you do plan to re-enable this logic, ensure item is structured properly.
async function addItemToProject(item: any, projectId: string, totalAmount: number) {
  const projectRef = doc(db, "projects", projectId);
  item.totalAmount = totalAmount;
  await addDoc(collection(projectRef, "items"), item);
}

/***********************
 *  GET PAYMENTS LIST
 ***********************/
export async function GET(request: Request) {
  try {
    const payments = await getDocs(collection(db, "payments"));
    const paymentsData = payments.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(paymentsData, { status: 200 });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
