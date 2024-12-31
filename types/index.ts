// src/types/index.ts

import { Item } from "@radix-ui/react-select";

// If you want a clear representation of ISO date strings:
export type ISODateString = string;

export type PaymentCategory = 
  | "income" 
  | "extraIncome"
  | "clientExpense" 
  | "projectExpense" 
  | "deduction" 
  | "extraExpense";

// Payment Type
export interface Item {
  name: string;
  measurementType?: 'weight' | 'volume' | 'quantity';
  quantity: number;
  unitPrice?: number;
}


export interface Payment {
  id?: string;
  projectId: string;
  date?: string;
  description?: string;
  stakeholder: Stakeholder; // Now a full object, not just a string
  item?: Item;
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
  extraIncome?: number;
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





export interface ProjectTransfer {
  projectName: string;
  totalTransferredToday: number;
}

export interface DayTransfer {
  date: string;
  totalAmount: number;
  projectTransfers: {
    [key: string]: ProjectTransfer;
  };
}

export interface Metrics {
  totalToday: number;
  totalMonth: number;
  projects: Project[];
  last10DaysTransfers: DayTransfer[];
}
