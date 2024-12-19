import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { faker } from '@faker-js/faker';
import * as dotenv from "dotenv";

dotenv.config();

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function seed() {
  // Number of projects, stakeholders per project, and payments per project
  const PROJECT_COUNT = 5;
  const STAKEHOLDERS_PER_PROJECT = 8;
  const PAYMENTS_PER_PROJECT = 30;

  // Predefined categories for payments
  const categories = ["income", "clientExpense", "projectExpense", "deduction", "extraExpense"] as const;

  for (let i = 0; i < PROJECT_COUNT; i++) {
    const projectData = {
      name: `${faker.company.name()} ${faker.word.noun()}`,
      budget: faker.number.int({ min: 1_000_000, max: 10_000_000 }),
      spent: 0,
      paymentTransferred: 0,
      client: faker.company.name(),
      deadline: faker.date.future().toISOString().split('T')[0], // YYYY-MM-DD
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

    const projectRef = await db.collection("projects").add(projectData);

    // Create stakeholders
    const stakeholders = [];
    for (let s = 0; s < STAKEHOLDERS_PER_PROJECT; s++) {
      const stakeholderData = {
        name: faker.person.fullName(),
        role: faker.helpers.arrayElement(["Engineer", "Architect", "Client", "Electrician", "Plumber", "Manager"]),
        contact:'+923450198292',
      };
      const stRef = await db.collection(`projects/${projectRef.id}/stakeholders`).add(stakeholderData);
      stakeholders.push({ id: stRef.id, ...stakeholderData });
    }

    // Create payments
    for (let p = 0; p < PAYMENTS_PER_PROJECT; p++) {
      const chosenStakeholder = faker.helpers.arrayElement(stakeholders);
      const category = faker.helpers.arrayElement(categories);
      const amount = faker.number.int({ min: 1000, max: 100_000 });
      const paymentData = {
        projectId: projectRef.id,
        date: faker.date.past().toISOString().split('T')[0],
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
      await db.collection("payments").add(paymentData);
    }
  }

  // Seed overview data (optional)
  // For simplicity, you can just create a random overview entry
  const today = new Date().toISOString().split('T')[0];
  await db.collection("overview").doc(today).set({
    date: today,
    totalTransferredToday: faker.number.int({ min: 100_000, max: 1_000_000 }),
    totalPaymentsToday: faker.number.int({ min: 10, max: 50 }),
    totalTransferredThisMonth: faker.number.int({ min: 1_000_000, max: 10_000_000 }),
  });

  const currentMonth = today.slice(0, 7);
  await db.collection("overview").doc(`month-${currentMonth}`).set({
    month: currentMonth,
    totalTransferredThisMonth: faker.number.int({ min: 1_000_000, max: 10_000_000 }),
    totalPaymentsThisMonth: faker.number.int({ min: 100, max: 500 }),
  });

  console.log("Database seeded with Faker data!");
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
