import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

// Helper function to calculate the start of the day
const startOfDay = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

// Helper function to calculate the start of the month
const startOfMonth = () => {
  const now = new Date();
  now.setDate(1);
  now.setHours(0, 0, 0, 0);
  return now;
};

export async function GET() {
  try {
    // Query Payments Collection
    const paymentsRef = collection(db, "payments");
    const today = startOfDay();
    const monthStart = startOfMonth();

    const todayQuery = query(paymentsRef, where("timestamp", ">=", today));
    const monthQuery = query(paymentsRef, where("timestamp", ">=", monthStart));
    const projectsRef = collection(db, "projects");

    // Fetch Today's Payments
    const todaySnapshot = await getDocs(todayQuery);
    const totalToday = todaySnapshot.docs.reduce(
      (sum, doc) => sum + (doc.data().amount || 0),
      0
    );

    // Fetch This Month's Payments
    const monthSnapshot = await getDocs(monthQuery);
    const totalMonth = monthSnapshot.docs.reduce(
      (sum, doc) => sum + (doc.data().amount || 0),
      0
    );

    // Fetch All Projects
    const projectsSnapshot = await getDocs(projectsRef);
    const projects = projectsSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
    }));

    return NextResponse.json({
      totalToday,
      totalMonth,
      projects,
    });
  } catch (error) {
    console.error("Error fetching overview metrics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
