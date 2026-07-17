const prisma = require("../config/db");
const { asyncHandler, ok, created, ApiError } = require("../utils/apiResponse");

/** POST /api/study-plans  { title, examBody, examDate, items: [{subjectName, topic, scheduledFor, durationMinutes}] } */
const createPlan = asyncHandler(async (req, res) => {
  const { title, examBody, examDate, items = [] } = req.body;

  const plan = await prisma.studyPlan.create({
    data: {
      userId: req.user.id,
      title: title || "My Study Plan",
      examBody,
      examDate: examDate ? new Date(examDate) : undefined,
      items: {
        create: items.map((i) => ({
          subjectName: i.subjectName,
          topic: i.topic,
          scheduledFor: new Date(i.scheduledFor),
          durationMinutes: i.durationMinutes || 45,
        })),
      },
    },
    include: { items: true },
  });

  created(res, { plan });
});

/** GET /api/study-plans */
const listPlans = asyncHandler(async (req, res) => {
  const plans = await prisma.studyPlan.findMany({
    where: { userId: req.user.id },
    include: { items: { orderBy: { scheduledFor: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  ok(res, { plans });
});

/** PATCH /api/study-plans/items/:itemId  { isCompleted } */
const toggleItem = asyncHandler(async (req, res) => {
  const item = await prisma.studyPlanItem.findUnique({
    where: { id: req.params.itemId },
    include: { studyPlan: true },
  });
  if (!item || item.studyPlan.userId !== req.user.id) throw new ApiError(404, "Study plan item not found.");

  const updated = await prisma.studyPlanItem.update({
    where: { id: item.id },
    data: { isCompleted: req.body.isCompleted },
  });
  ok(res, { item: updated });
});

/** POST /api/study-plans/:id/items  { subjectName, topic, scheduledFor, durationMinutes } — append one revision session to an existing plan */
const addItem = asyncHandler(async (req, res) => {
  const plan = await prisma.studyPlan.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!plan) throw new ApiError(404, "Study plan not found.");

  const { subjectName, topic, scheduledFor, durationMinutes } = req.body;
  const item = await prisma.studyPlanItem.create({
    data: {
      studyPlanId: plan.id,
      subjectName,
      topic,
      scheduledFor: new Date(scheduledFor),
      durationMinutes: durationMinutes || 45,
    },
  });
  created(res, { item });
});

module.exports = { createPlan, listPlans, toggleItem, addItem };
