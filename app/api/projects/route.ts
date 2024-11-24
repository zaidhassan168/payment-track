import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, getDocs, query, getDoc, doc, addDoc, setDoc, writeBatch } from "firebase/firestore";
import { Project, Stakeholder } from "@/types";
export async function POST(req: Request) {
    try {
      const data: Project & { stakeholders: Stakeholder[] } = await req.json();
  
      if (!data.name || !data.budget || !data.client) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }
  
      // Create a new project document
      const projectRef = await addDoc(collection(db, "projects"), {
        name: data.name,
        budget: data.budget,
        spent: 0, // Default value for spent
        paymentTransferred: 0, // Default value for paymentTransferred
        client: data.client,
        deadline: data.deadline || null,
      });
  
      // Add stakeholders to the project's `stakeholders` subcollection
      const stakeholdersRef = collection(db, `projects/${projectRef.id}/stakeholders`);
      const batch = writeBatch(db);
  
      data.stakeholders.forEach((stakeholder) => {
        const stakeholderDocRef = doc(stakeholdersRef); // Auto-generate ID
        batch.set(stakeholderDocRef, stakeholder);
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
          const projectData = projectDoc.data() as Project;
  
          // Fetch stakeholders subcollection
          const stakeholdersRef = collection(db, `projects/${projectDoc.id}/stakeholders`);
          const stakeholdersSnapshot = await getDocs(stakeholdersRef);
          const stakeholders = stakeholdersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
  
          return { id: projectDoc.id, ...projectData, stakeholders };
        })
      );
  
      return NextResponse.json(projects, { status: 200 });
    } catch (error) {
      console.error("Error fetching projects:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }