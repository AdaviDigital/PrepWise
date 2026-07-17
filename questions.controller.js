const prisma = require("../config/db");
const { asyncHandler, ok, created, ApiError } = require("../utils/apiResponse");

/** GET /api/questions?subject=&examBody=&year=&difficulty=&topic=&page=&limit= */
const listQuestions = asyncHandler(async (req, res) => {
  const { subject, examBody, year, difficulty, topic, page = "1", limit = "20" } = req.query;

  const where = {
    isPublished: true,
    ...(subject ? { subject: { slug: subject } } : {}),
    ...(examBody ? { examBody } : {}),
    ...(year ? { examYear: parseInt(year, 10) } : {}),
    ...(difficulty ? { difficulty } : {}),
    ...(topic ? { topicId: topic } : {}),
  };

  const take = Math.min(parseInt(limit, 10) || 20, 100);
  const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

  const [items, total] = await Promise.all([
    prisma.question.findMany({
      where,
      include: { subject: true, topic: true },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.question.count({ where }),
  ]);

  ok(res, { items }, { total, page: Number(page), limit: take, pages: Math.ceil(total / take) });
});

/** GET /api/questions/:id */
const getQuestion = asyncHandler(async (req, res) => {
  const question = await prisma.question.findUnique({
    where: { id: req.params.id },
    include: { subject: true, topic: true },
  });
  if (!question) throw new ApiError(404, "Question not found.");
  ok(res, { question });
});

/** POST /api/questions — TEACHER/SCHOOL_ADMIN/ADMIN only */
const createQuestion = asyncHandler(async (req, res) => {
  const { subjectId, topicId, examBody, examYear, difficulty, prompt, options, correctKey, explanation, imageUrl } = req.body;

  if (!Array.isArray(options) || options.length < 2) {
    throw new ApiError(422, "A question needs at least two answer options.");
  }
  if (!options.some((o) => o.key === correctKey)) {
    throw new ApiError(422, "correctKey must match one of the provided option keys.");
  }

  const question = await prisma.question.create({
    data: { subjectId, topicId, examBody, examYear, difficulty, prompt, options, correctKey, explanation, imageUrl },
  });
  created(res, { question });
});

/** PATCH /api/questions/:id */
const updateQuestion = asyncHandler(async (req, res) => {
  const question = await prisma.question.update({
    where: { id: req.params.id },
    data: req.body,
  }).catch(() => null);
  if (!question) throw new ApiError(404, "Question not found.");
  ok(res, { question });
});

/** DELETE /api/questions/:id */
const deleteQuestion = asyncHandler(async (req, res) => {
  await prisma.question.delete({ where: { id: req.params.id } }).catch(() => {
    throw new ApiError(404, "Question not found.");
  });
  ok(res, { deleted: true });
});

/** POST /api/questions/:id/bookmark */
const toggleBookmark = asyncHandler(async (req, res) => {
  const existing = await prisma.bookmark.findUnique({
    where: { userId_questionId: { userId: req.user.id, questionId: req.params.id } },
  });
  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return ok(res, { bookmarked: false });
  }
  await prisma.bookmark.create({ data: { userId: req.user.id, questionId: req.params.id } });
  ok(res, { bookmarked: true });
});

module.exports = { listQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion, toggleBookmark };
