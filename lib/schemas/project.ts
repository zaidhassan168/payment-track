import { z } from "zod";
import { stakeholderSchema } from "./stakeholder";

export const projectSchema = z.object({
  name: z.string().nonempty("Project name is required"),
  budget: z.number().positive("Budget must be a positive number"),
  client: z.string().nonempty("Client is required"),
  deadline: z.string().optional(),
  stakeholders: z.array(stakeholderSchema).optional().default([]),
});