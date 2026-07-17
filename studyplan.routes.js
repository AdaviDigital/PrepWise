const router = require("express").Router();
const ctrl = require("../controllers/studyplan.controller");
const { requireAuth } = require("../middleware/auth");
const { validateBody } = require("../middleware/validate");
const { z } = require("zod");
const { studyPlanSchema } = require("../utils/schemas");

const addItemSchema = z.object({
  subjectName: z.string().min(1),
  topic: z.string().min(1),
  scheduledFor: z.string(),
  durationMinutes: z.number().int().positive().optional(),
});

router.use(requireAuth());
router.post("/", validateBody(studyPlanSchema), ctrl.createPlan);
router.get("/", ctrl.listPlans);
router.post("/:id/items", validateBody(addItemSchema), ctrl.addItem);
router.patch("/items/:itemId", ctrl.toggleItem);

module.exports = router;
