import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { faker } from "@faker-js/faker";

export async function GET() {
  try {
    // Define how much data to create
    const PROJECT_COUNT = 3;
    const STAKEHOLDERS_PER_PROJECT = 5;
    const PAYMENTS_PER_PROJECT = 10;
    const categories = ["income", "clientExpense", "projectExpense", "deduction", "extraExpense"] as const;

    for (let i = 0; i < PROJECT_COUNT; i++) {
      const projectData = {
        name: `${faker.company.name()} ${faker.word.noun()}`,
        budget: faker.number.int({ min: 1_000_000, max: 5_000_000 }),
        spent: 0,
        paymentTransferred: 0,
        client: faker.company.name(),
        deadline: faker.date.future().toISOString().split("T")[0],
        paymentSummary: {
          totalIncome: 0,
          totalExpenses: {
            clientExpense: 0,
            projectExpense: 0,
            deduction: 0,
            extraExpense: 0,
          },
          balance: 0,
        },
      };

      const projectRef = await addDoc(collection(db, "projects"), projectData);

      const stakeholders = [];
      for (let s = 0; s < STAKEHOLDERS_PER_PROJECT; s++) {
        const stakeholderData = {
          name: faker.person.fullName(),
          role: faker.helpers.arrayElement(["Engineer", "Architect", "Client", "Electrician", "Plumber", "Manager"]),
          contact: '+923450198292',
        };
        const stRef = await addDoc(collection(db, `projects/${projectRef.id}/stakeholders`), stakeholderData);
        stakeholders.push({ id: stRef.id, ...stakeholderData });
      }

      for (let p = 0; p < PAYMENTS_PER_PROJECT; p++) {
        const chosenStakeholder = faker.helpers.arrayElement(stakeholders);
        const category = faker.helpers.arrayElement(categories);
        const amount = faker.number.int({ min: 1000, max: 100_000 });
        const paymentData = {
          projectId: projectRef.id,
          date: faker.date.past().toISOString().split("T")[0],
          description: faker.commerce.productDescription(),
          stakeholder: chosenStakeholder,
          item: faker.commerce.product(),
          category: category,
          amount: amount,
          sentTo: faker.company.name(),
          from: faker.company.name(),
          screenshotUrl: "",
          timestamp: new Date().toISOString(),
        };
        await addDoc(collection(db, "payments"), paymentData);
      }
    }

    // Create a sample overview
    const today = new Date().toISOString().split("T")[0];
    await addDoc(collection(db, "overview"), {
      date: today,
      totalTransferredToday: faker.number.int({ min: 100_000, max: 1_000_000 }),
      totalPaymentsToday: faker.number.int({ min: 10, max: 50 }),
      totalTransferredThisMonth: faker.number.int({ min: 1_000_000, max: 10_000_000 }),
    });

    const currentMonth = today.slice(0, 7);
    await addDoc(collection(db, "overview"), {
      month: currentMonth,
      totalTransferredThisMonth: faker.number.int({ min: 1_000_000, max: 10_000_000 }),
      totalPaymentsThisMonth: faker.number.int({ min: 100, max: 500 }),
    });

    return NextResponse.json({ message: "Database seeded with Faker data!" }, { status: 200 });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
