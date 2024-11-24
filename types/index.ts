// src/types/index.ts

// Payment Type
export interface Payment {
    id?: string; // Optional for Firestore documents
    projectId: string;
    stakeholder: string;
    amount: number;
    screenshotUrl: string;
    timestamp: string;
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
  }
  