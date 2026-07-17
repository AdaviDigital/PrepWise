const router = require("express").Router();
const ctrl = require("../controllers/questions.controller");
const { requireAuth, requireRole, optionalAuth } = require("../middleware/auth");
const { validateBody } = require("../middleware/validate");
const { createQuestionSchema } = require("../utils/schemas");

router.get("/", optionalAuth(), ctrl.listQuestions);
router.get("/:id", optionalAuth(), ctrl.getQuestion);

router.post(
  "/",
  requireAuth(),
  requireRole("TEACHER", "SCHOOL_ADMIN", "ADMIN"),
  validateBody(createQuestionSchema),
  ctrl.createQuestion
);
router.patch("/:id", requireAuth(), requireRole("TEACHER", "SCHOOL_ADMIN", "ADMIN"), ctrl.updateQuestion);
router.delete("/:id", requireAuth(), requireRole("SCHOOL_ADMIN", "ADMIN"), ctrl.deleteQuestion);
router.post("/:id/bookmark", requireAuth(), ctrl.toggleBookmark);

module.exports = router;
