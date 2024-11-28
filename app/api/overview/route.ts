import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export async function GET() {
  try {
    // Fetch today's overview
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const todayRef = doc(db, "overview", today);
    const todayDoc = await getDoc(todayRef);

    const totalToday = todayDoc.exists()
      ? todayDoc.data().totalTransferredToday
      : 0;

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const monthRef = doc(db, "overview", `month-${currentMonth}`);
    const monthDoc = await getDoc(monthRef);

    const totalMonth = monthDoc.exists()
      ? monthDoc.data().totalTransferredThisMonth
      : 0;

    // Fetch all projects
    const projectsSnapshot = await getDocs(collection(db, "projects"));
    const projects = projectsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      totalToday,
      totalMonth,
      projects,
    });
  } catch (error) {
    console.error("Error fetching overview metrics:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
