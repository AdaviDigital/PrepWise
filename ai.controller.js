const prisma = require("../config/db");
const openaiService = require("../services/openai.service");
const { asyncHandler, ok, created, ApiError } = require("../utils/apiResponse");

/** POST /api/ai/sessions — start a new AI tutor conversation */
const createSession = asyncHandler(async (req, res) => {
  const { title, subjectHint } = req.body;
  const session = await prisma.aiChatSession.create({
    data: { userId: req.user.id, title: title || "New conversation", subjectHint },
  });
  created(res, { session });
});

/** GET /api/ai/sessions — list a user's conversations */
const listSessions = asyncHandler(async (req, res) => {
  const sessions = await prisma.aiChatSession.findMany({
    where: { userId: req.user.id },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });
  ok(res, { sessions });
});

/** GET /api/ai/sessions/:id — full conversation with messages */
const getSession = asyncHandler(async (req, res) => {
  const session = await prisma.aiChatSession.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!session) throw new ApiError(404, "Conversation not found.");
  ok(res, { session });
});

/**
 * POST /api/ai/sessions/:id/messages  { message }
 * The core AI Study Assistant endpoint — keeps your OpenAI key server-side,
 * stores the full transcript, and returns the tutor's reply.
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) throw new ApiError(422, "Please enter a question or message.");

  const session = await prisma.aiChatSession.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } },
  });
  if (!session) throw new ApiError(404, "Conversation not found.");

  await prisma.aiChatMessage.create({
    data: { sessionId: session.id, role: "USER", content: message },
  });

  const { content, tokensUsed } = await openaiService.chatCompletion({
    history: session.messages,
    userMessage: message,
    subjectHint: session.subjectHint,
  });

  const reply = await prisma.aiChatMessage.create({
    data: { sessionId: session.id, role: "ASSISTANT", content, tokensUsed },
  });

  await prisma.aiChatSession.update({ where: { id: session.id }, data: { updatedAt: new Date() } });

  ok(res, { reply });
});

/**
 * POST /api/ai/homework — AI Homework Helper.
 * Accepts an uploaded image/PDF (via multer, see uploads.routes.js) that has
 * already been stored (Cloudinary URL passed in) and a text prompt, then
 * returns a step-by-step explanation.
 */
const solveHomework = asyncHandler(async (req, res) => {
  const { question, fileUrl, subjectHint } = req.body;
  if (!question && !fileUrl) throw new ApiError(422, "Please provide a question or upload a file.");

  const { content } = await openaiService.chatCompletion({
    history: [],
    userMessage: fileUrl
      ? `A student uploaded a homework file: ${fileUrl}\nQuestion/context: ${question || "Please read and solve this."}`
      : question,
    subjectHint,
  });

  ok(res, { explanation: content });
});

/** POST /api/ai/questions/:id/explain — AI explanation for a question bank item */
const explainQuestion = asyncHandler(async (req, res) => {
  const question = await prisma.question.findUnique({ where: { id: req.params.id } });
  if (!question) throw new ApiError(404, "Question not found.");

  if (question.aiExplanation) return ok(res, { explanation: question.aiExplanation, cached: true });

  const explanation = await openaiService.explainQuestion({
    prompt: question.prompt,
    options: question.options,
    correctKey: question.correctKey,
  });

  await prisma.question.update({ where: { id: question.id }, data: { aiExplanation: explanation } });
  ok(res, { explanation, cached: false });
});

module.exports = { createSession, listSessions, getSession, sendMessage, solveHomework, explainQuestion };
