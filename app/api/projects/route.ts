import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { 
  collection, 
  getDocs, 
  query, 
  doc, 
  addDoc, 
  writeBatch 
} from "firebase/firestore";
import { Project, Stakeholder } from "@/types";
import { ISODateString, PaymentCategory } from "@/types"; // Assuming you have these

// POST: Create a new project
export async function POST(req: Request) {
  try {
    const data = await req.json() as Project & { stakeholders: Stakeholder[] };

    if (!data.name || !data.budget || !data.client) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Initialize paymentSummary if you want a default structure
    const defaultPaymentSummary = {
      income: 0,
      totalExpenses: {
        clientExpense: 0,
        projectExpense: 0,
        deduction: 0,
        extraExpense: 0
      },
      balance: 0
    };

    // Create a new project document with default values
    const projectRef = await addDoc(collection(db, "projects"), {
      name: data.name,
      budget: data.budget,
      spent: 0, // Default value for spent
      paymentTransferred: 0, // Default for paymentTransferred
      client: data.client,
      deadline: data.deadline || null, // store null if not provided
      // Initialize paymentSummary if needed:
      paymentSummary: defaultPaymentSummary
    });

    // Add stakeholders to the project's `stakeholders` subcollection
    const stakeholdersRef = collection(db, `projects/${projectRef.id}/stakeholders`);
    const batch = writeBatch(db);

    data.stakeholders.forEach((stakeholder) => {
      // Remove undefined optional fields if needed or just store as is
      // Cast or ensure correct structure (stakeholder interface already ensures correct typing)
      const stakeholderData: Stakeholder = {
        name: stakeholder.name,
        role: stakeholder.role,
        contact: stakeholder.contact
      };
      
      const stakeholderDocRef = doc(stakeholdersRef); // Auto-generate ID
      batch.set(stakeholderDocRef, stakeholderData);
    });

    await batch.commit();

    return NextResponse.json({ id: projectRef.id, message: "Project created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// GET: Retrieve all projects
export async function GET() {
  try {
    const projectsQuery = query(collection(db, "projects"));
    const projectsSnapshot = await getDocs(projectsQuery);

    const projects = await Promise.all(
      projectsSnapshot.docs.map(async (projectDoc) => {
        const projectData = projectDoc.data();
        
        // Cast to Project type - we know these fields exist in the DB
        const project: Project = {
          id: projectDoc.id,
          name: projectData.name,
          budget: projectData.budget,
          spent: projectData.spent,
          client: projectData.client,
          paymentTransferred: projectData.paymentTransferred,
          deadline: projectData.deadline ?? null,
          paymentSummary: projectData.paymentSummary ?? undefined
        };

        // Fetch stakeholders subcollection
        const stakeholdersRef = collection(db, `projects/${projectDoc.id}/stakeholders`);
        const stakeholdersSnapshot = await getDocs(stakeholdersRef);

        const stakeholders: Stakeholder[] = stakeholdersSnapshot.docs.map((stDoc) => {
          const stData = stDoc.data();
          return {
            id: stDoc.id,
            name: stData.name,
            role: stData.role,
            contact: stData.contact
          };
        });

        // Include stakeholders in the returned object
        return { ...project, stakeholders };
      })
    );

    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
