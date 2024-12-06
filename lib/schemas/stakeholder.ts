import { z } from "zod";
export const stakeholderSchema = z.object({
    name: z.string().nonempty("Stakeholder name is required"),
    role: z.string().nonempty("Stakeholder role is required"),
    contact: z.string().nonempty("Stakeholder contact is required"),
  });