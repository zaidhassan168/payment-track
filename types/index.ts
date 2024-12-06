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
  id?: string; // Assigned by Firestore on create.
  projectId: string;
  date?: ISODateString;           // If not provided, set automatically at creation
  description?: string;
  
  // If this references a stakeholder by name or ID, clarify:
  // If by ID:
  // stakeholderId?: string;
  // If by Name:
  stakeholder?: string; 
  item?: string; // e.g., "Cement", "Fuel"
  category: PaymentCategory;
  amount: number;
  sentTo?: string;       // Name or identifier of who received the payment
  from?: string;         // Name or identifier of who sent the payment
  screenshotUrl?: string;
  timestamp?: ISODateString; // Auto-added if not specified
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
