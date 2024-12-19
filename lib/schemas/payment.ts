// src/lib/schemas/payment.ts
import { z } from "zod";
import { stakeholderSchema } from "./stakeholder";

export const paymentSchema = z.object({
  projectId: z.string().nonempty("projectId is required"),
  date: z.string().optional(),
  description: z.string().optional(),
  stakeholder: stakeholderSchema, // Now required
  item: z.string().optional(),
  category: z.enum(["income", "clientExpense", "projectExpense", "deduction", "extraExpense"]),
  amount: z.number().positive("amount must be a positive number"),
  sentTo: z.string().optional(),
  from: z.string().optional(),
  screenshotUrl: z.string()
    .url()
    .regex(/^https:\/\//i, "URL must use HTTPS")
    .optional()
    .transform((val) => val || null),
  timestamp: z.string().optional(),
  projectName: z.string().optional(),
});
