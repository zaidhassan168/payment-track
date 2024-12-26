import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, getDocs, doc, getDoc, query, where, orderBy, limit } from "firebase/firestore";

export async function GET() {
  try {
    // Fetch today's overview
    const today = new Date().toISOString().split("T")[0];
    const todayRef = doc(db, "overview", today);
    const todayDoc = await getDoc(todayRef);

    const todayData = todayDoc.exists() ? todayDoc.data() : null;
    const totalToday = todayData?.totalTransferredToday || 0;

    // Fetch current month's overview
    const currentMonth = new Date().toISOString().slice(0, 7);
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

    // Fetch last 10 days of transfer data with project-specific transfers
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const transfersQuery = query(
      collection(db, "overview"),
      where("date", ">=", tenDaysAgo.toISOString().split("T")[0]),
      orderBy("date", "desc"),
      limit(10)
    );
    
    const transfersSnapshot = await getDocs(transfersQuery);
    const last10DaysTransfers = transfersSnapshot.docs.map(doc => {
      const data = doc.data();
      const projectTransfers: { [key: string]: { projectName: string; totalTransferredToday: number } } = {};
      
      // Extract all fields that are objects and contain projectName
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null && 'projectName' in value) {
          projectTransfers[key] = {
            projectName: value.projectName,
            totalTransferredToday: value.totalTransferredToday || 0
          };
        }
      });

      return {
        date: doc.id,
        totalAmount: data.totalTransferredToday || 0,
        projectTransfers
      };
    }).reverse();

    return NextResponse.json({
      totalToday,
      totalMonth,
      projects,
      last10DaysTransfers
    });
  } catch (error) {
    console.error("Error fetching overview metrics:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

