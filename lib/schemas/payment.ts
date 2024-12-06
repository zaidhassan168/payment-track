// src/schemas/payment.ts
import { z } from "zod";

export const paymentSchema = z.object({
  projectId: z.string().nonempty("projectId is required"),
  date: z.string().optional(),          // We can trust or refine later
  description: z.string().optional(),
  stakeholder: z.string().optional(),
  item: z.string().optional(),
  category: z.enum(["income", "clientExpense", "projectExpense", "deduction", "extraExpense"]),
  amount: z.number().positive("amount must be a positive number"),
  sentTo: z.string().optional(),
  from: z.string().optional(),
  screenshotUrl: z.string().url().optional().or(z.literal("")), // allow empty or a valid URL
  timestamp: z.string().optional(),
});
