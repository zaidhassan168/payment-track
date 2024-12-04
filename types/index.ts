// src/types/index.ts

// Payment Type

  export interface Payment {
    id?: string;
    projectId: string;
    date?: string; // ISO string for the date
    description?: string;
    stakeholder?: string; // e.g., Income, Client Expense, Project Expense
    item?: string; // Optional, e.g., Cement, Fuel
    category: string; // e.g., Deduction, Extra Expense
    amount: number;
    sentTo?: string; // Person or entity name
    from?: string; // Person or entity name
    screenshotUrl?: string; // Optional for receipts/screenshots
    timestamp?: string; // Auto-added if not specified
  }
  
  
  // Stakeholder Type
  export interface Stakeholder {
    id?: string;
    name: string;
    role: string; // Example: 'Plumber', 'Electrician'
    contact: string; // Phone or email
  }
  
  // Project Type
  export interface Project {
    id?: string;
    name: string;
    budget: number;
    spent: number;
    client: string;
    paymentTransferred: number;
    deadline?: string; // Optional
    stakeholders?: Stakeholder[]; // Optional
    projectId: string; // Optional
  }
  