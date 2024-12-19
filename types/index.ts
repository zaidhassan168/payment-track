// src/types/index.ts

// If you want a clear representation of ISO date strings:
export type ISODateString = string;

export type PaymentCategory = 
  | "income" 
  | "clientExpense" 
  | "projectExpense" 
  | "deduction" 
  | "extraExpense";

// Payment Type
export interface Payment {
  id?: string;
  projectId: string;
  date?: string;
  description?: string;
  stakeholder: Stakeholder; // Now a full object, not just a string
  item?: string;
  category: PaymentCategory;
  amount: number;
  sentTo?: string;
  from?: string;
  screenshotUrl?: string;
  timestamp?: string;
  projectName?: string;
}

// Stakeholder Type
export interface Stakeholder {
  id?: string;
  name: string;
  role: string; // e.g., 'Plumber', 'Electrician'
  contact: string; // e.g., phone or email
}

// Define a type for PaymentSummary categories to ensure consistency:
export interface PaymentSummary {
  totalIncome: number;
  totalExpenses: {
    clientExpense: number;
    projectExpense: number;
    deduction: number;
    extraExpense: number;
  };
  balance: number;
}

// Project Type
export interface Project {
  id?: string;             // Firestore document ID
  name: string;
  budget: number;
  spent: number;
  client: string;
  paymentTransferred: number;
  deadline?: ISODateString;  // Optional
  stakeholders?: Stakeholder[]; 
  // Remove projectId if redundant. If you need a separate user-defined ID, rename it:
  // externalId?: string;

  paymentSummary?: PaymentSummary;
}
