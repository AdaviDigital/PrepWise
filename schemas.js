const { z } = require("zod");

const registerSchema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["STUDENT", "PARENT", "TEACHER"]).optional(),
  phone: z.string().min(7).optional(),
  level: z.enum(["PRIMARY", "SECONDARY", "TERTIARY", "PROFESSIONAL"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().optional(),
  message: z.string().min(5, "Message is too short"),
  userId: z.string().uuid().optional(),
});

const aiMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(4000, "Message is too long"),
});

const createQuestionSchema = z.object({
  subjectId: z.string().uuid(),
  topicId: z.string().uuid().optional(),
  examBody: z.string(),
  examYear: z.number().int().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  prompt: z.string().min(3),
  options: z.array(z.object({ key: z.string(), text: z.string() })).min(2),
  correctKey: z.string(),
  explanation: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

const createExamSchema = z.object({
  title: z.string().min(3),
  examBody: z.string(),
  subjectId: z.string().uuid().optional(),
  durationMinutes: z.number().int().positive().optional(),
  questionIds: z.array(z.string().uuid()).min(1),
});

const saveAnswerSchema = z.object({
  questionId: z.string().uuid(),
  selectedKey: z.string(),
  isFlagged: z.boolean().optional(),
});

const studyPlanSchema = z.object({
  title: z.string().optional(),
  examBody: z.string().optional(),
  examDate: z.string().optional(),
  items: z
    .array(
      z.object({
        subjectName: z.string(),
        topic: z.string(),
        scheduledFor: z.string(),
        durationMinutes: z.number().int().positive().optional(),
      })
    )
    .default([]),
});

const paymentInitSchema = z.object({
  plan: z.enum(["BASIC", "PREMIUM"]),
});

module.exports = {
  registerSchema,
  loginSchema,
  contactSchema,
  aiMessageSchema,
  createQuestionSchema,
  createExamSchema,
  saveAnswerSchema,
  studyPlanSchema,
  paymentInitSchema,
};
