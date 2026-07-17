const prisma = require("../config/db");
const { asyncHandler, ok, created, ApiError } = require("../utils/apiResponse");

/** GET /api/exams — list available CBT exams (question count only, no answers) */
const listExams = asyncHandler(async (req, res) => {
  const { examBody, subjectId } = req.query;
  const exams = await prisma.cbtExam.findMany({
    where: {
      isPublished: true,
      ...(examBody ? { examBody } : {}),
      ...(subjectId ? { subjectId } : {}),
    },
    include: { _count: { select: { questions: true } } },
    orderBy: { createdAt: "desc" },
  });
  ok(res, { exams });
});

/** POST /api/exams — TEACHER/SCHOOL_ADMIN/ADMIN creates a CBT exam from question IDs */
const createExam = asyncHandler(async (req, res) => {
  const { title, examBody, subjectId, durationMinutes, questionIds } = req.body;
  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    throw new ApiError(422, "Provide at least one question ID for this exam.");
  }

  const exam = await prisma.cbtExam.create({
    data: {
      title,
      examBody,
      subjectId,
      durationMinutes: durationMinutes || 60,
      totalMarks: questionIds.length,
      createdById: req.user.id,
      questions: {
        create: questionIds.map((questionId, i) => ({ questionId, order: i })),
      },
    },
    include: { questions: true },
  });
  created(res, { exam });
});

/**
 * POST /api/exams/:id/start
 * Creates an attempt and returns questions WITHOUT the correct answer, so a
 * curious student can't just read it out of the network tab.
 */
const startAttempt = asyncHandler(async (req, res) => {
  const exam = await prisma.cbtExam.findUnique({
    where: { id: req.params.id },
    include: { questions: { include: { question: true }, orderBy: { order: "asc" } } },
  });
  if (!exam || !exam.isPublished) throw new ApiError(404, "Exam not found.");

  const attempt = await prisma.cbtAttempt.create({
    data: {
      userId: req.user.id,
      cbtExamId: exam.id,
      totalQuestions: exam.questions.length,
    },
  });

  const questions = exam.questions.map((eq) => ({
    id: eq.question.id,
    prompt: eq.question.prompt,
    options: eq.question.options,
    imageUrl: eq.question.imageUrl,
    difficulty: eq.question.difficulty,
    order: eq.order,
  }));

  created(res, {
    attempt: { id: attempt.id, startedAt: attempt.startedAt, durationMinutes: exam.durationMinutes },
    exam: { id: exam.id, title: exam.title, totalMarks: exam.totalMarks },
    questions,
  });
});

/** POST /api/exams/attempts/:attemptId/answer  { questionId, selectedKey } — autosave one answer */
const saveAnswer = asyncHandler(async (req, res) => {
  const { questionId, selectedKey, isFlagged } = req.body;
  const attempt = await prisma.cbtAttempt.findFirst({
    where: { id: req.params.attemptId, userId: req.user.id, status: "IN_PROGRESS" },
  });
  if (!attempt) throw new ApiError(404, "Active exam attempt not found.");

  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) throw new ApiError(404, "Question not found.");

  const answer = await prisma.cbtAnswer.upsert({
    where: { attemptId_questionId: { attemptId: attempt.id, questionId } },
    update: { selectedKey, isFlagged: Boolean(isFlagged), isCorrect: selectedKey === question.correctKey },
    create: {
      attemptId: attempt.id,
      questionId,
      selectedKey,
      isFlagged: Boolean(isFlagged),
      isCorrect: selectedKey === question.correctKey,
    },
  });
  ok(res, { answer: { questionId: answer.questionId, selectedKey: answer.selectedKey, isFlagged: answer.isFlagged } });
});

/**
 * POST /api/exams/attempts/:attemptId/submit
 * Auto-grades: counts correct answers, stores the score, marks the attempt
 * GRADED, and awards XP/points toward gamification.
 */
const submitAttempt = asyncHandler(async (req, res) => {
  const attempt = await prisma.cbtAttempt.findFirst({
    where: { id: req.params.attemptId, userId: req.user.id },
    include: { answers: true, cbtExam: true },
  });
  if (!attempt) throw new ApiError(404, "Exam attempt not found.");
  if (attempt.status === "GRADED") throw new ApiError(409, "This attempt has already been submitted.");

  const correctCount = attempt.answers.filter((a) => a.isCorrect).length;
  const timeSpentSeconds = Math.round((Date.now() - new Date(attempt.startedAt).getTime()) / 1000);

  const graded = await prisma.cbtAttempt.update({
    where: { id: attempt.id },
    data: {
      status: "GRADED",
      score: correctCount,
      submittedAt: new Date(),
      timeSpentSeconds,
    },
  });

  // Gamification: award points/XP proportional to performance.
  const pointsEarned = correctCount * 10;
  await prisma.studentProfile.updateMany({
    where: { userId: req.user.id },
    data: { points: { increment: pointsEarned }, xp: { increment: pointsEarned }, lastActivityDate: new Date() },
  });

  ok(res, {
    result: {
      score: correctCount,
      totalQuestions: attempt.totalQuestions,
      percentage: attempt.totalQuestions ? Math.round((correctCount / attempt.totalQuestions) * 100) : 0,
      timeSpentSeconds,
      pointsEarned,
    },
  });
});

/** GET /api/exams/attempts/:attemptId/review — full breakdown with correct answers + explanations */
const reviewAttempt = asyncHandler(async (req, res) => {
  const attempt = await prisma.cbtAttempt.findFirst({
    where: { id: req.params.attemptId, userId: req.user.id },
    include: {
      answers: { include: { question: true } },
      cbtExam: true,
    },
  });
  if (!attempt) throw new ApiError(404, "Exam attempt not found.");

  const review = attempt.answers.map((a) => ({
    question: a.question.prompt,
    options: a.question.options,
    correctKey: a.question.correctKey,
    selectedKey: a.selectedKey,
    isCorrect: a.isCorrect,
    explanation: a.question.explanation || a.question.aiExplanation,
  }));

  ok(res, { attempt: { id: attempt.id, score: attempt.score, status: attempt.status }, review });
});

/** GET /api/exams/attempts — a student's exam history */
const myAttempts = asyncHandler(async (req, res) => {
  const attempts = await prisma.cbtAttempt.findMany({
    where: { userId: req.user.id },
    include: { cbtExam: { select: { title: true, examBody: true } } },
    orderBy: { startedAt: "desc" },
    take: 50,
  });
  ok(res, { attempts });
});

/** GET /api/exams/leaderboard?examBody= */
const leaderboard = asyncHandler(async (req, res) => {
  const { examBody } = req.query;
  const attempts = await prisma.cbtAttempt.findMany({
    where: { status: "GRADED", ...(examBody ? { cbtExam: { examBody } } : {}) },
    include: { user: { select: { firstName: true, lastName: true } } },
    orderBy: { score: "desc" },
    take: 20,
  });
  ok(res, {
    leaderboard: attempts.map((a, i) => ({
      rank: i + 1,
      name: `${a.user.firstName} ${a.user.lastName.charAt(0)}.`,
      score: a.score,
      totalQuestions: a.totalQuestions,
    })),
  });
});

module.exports = {
  listExams,
  createExam,
  startAttempt,
  saveAnswer,
  submitAttempt,
  reviewAttempt,
  myAttempts,
  leaderboard,
};
