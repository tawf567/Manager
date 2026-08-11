import { z } from "zod";

export const objectiveSchema = z.object({
  name: z.string().trim().min(1, "An objective name is required.").max(80),
  description: z.string().trim().max(280).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Choose a valid color."),
});
