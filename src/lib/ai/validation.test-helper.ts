import { z } from "zod";

export const tutorInputSchema = z.object({
  question: z.string().trim().min(3).max(2000),
  learnerLevel: z.enum(["primary", "junior_secondary", "senior_secondary", "exam_prep"]),
  subject: z.string().trim().max(100).optional(),
  topic: z.string().trim().max(150).optional(),
  language: z.enum(["en", "pcm"]).optional()
});
