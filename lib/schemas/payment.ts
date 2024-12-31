// src/lib/schemas/payment.ts
import { z } from "zod";
import { stakeholderSchema } from "./stakeholder";

export const paymentSchema = z.object({
  projectId: z.string().nonempty("projectId is required"),
  date: z.string().optional(),
  description: z.string().optional(),
  stakeholder: stakeholderSchema, // Now required
  item: z.object({
    name: z.string().nonempty("Item name is required"),
    measurementType: z.enum(["weight", "volume", "quantity"]).optional(),
    quantity: z.number().positive("Quantity must be a positive number"),
    unitPrice: z.number().positive("Unit price must be a positive number").optional(),
  }).optional(),
  category: z.enum(["income", "clientExpense", "projectExpense", "deduction", "extraExpense", "extraIncome"]),
  amount: z.number().positive("amount must be a positive number"),
  sentTo: z.string().optional(),
  from: z.string().optional(),
  screenshotUrl: z.string().url().optional(),
  timestamp: z.string().optional(),
  projectName: z.string().optional(),

});
