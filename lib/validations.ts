import { z } from "zod";

export const testCreationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  duration: z.number().min(10, "Duration must be at least 10 minutes"),
  requiredTier: z.enum(["NORMAL", "PREMIUM", "SUPER_PREMIUM"]),
  examType: z.enum(["FULL_MOCK", "TOPIC_WISE", "YEAR_WISE"]),
  questions: z.array(
    z.object({
      text: z.string().min(1, "Question text is required"),
      textAs: z.string().optional(),
      imageUrl: z.string().nullable().optional(),
      options: z.array(z.string().min(1, "Option text is required")).length(4),
      optionsAs: z.array(z.string()).length(4).optional(),
      correctIndex: z.number().min(0).max(3),
      section: z.string(),
      marks: z.number().default(4),
      negativeMarks: z.number().default(1),
    })
  ).min(1, "At least one question is required"),
});

export const attemptSubmissionSchema = z.object({
  testId: z.string(),
  answers: z.record(z.string(), z.number()), // Map of questionId to selected option index
});

export const userRegistrationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});
