const router = require("express").Router();
const ctrl = require("../controllers/exams.controller");
const { requireAuth, requireRole } = require("../middleware/auth");
const { validateBody } = require("../middleware/validate");
const { createExamSchema, saveAnswerSchema } = require("../utils/schemas");

router.get("/", ctrl.listExams);
router.get("/leaderboard", ctrl.leaderboard);

router.use(requireAuth());

router.post("/", requireRole("TEACHER", "SCHOOL_ADMIN", "ADMIN"), validateBody(createExamSchema), ctrl.createExam);
router.post("/:id/start", ctrl.startAttempt);
router.post("/attempts/:attemptId/answer", validateBody(saveAnswerSchema), ctrl.saveAnswer);
router.post("/attempts/:attemptId/submit", ctrl.submitAttempt);
router.get("/attempts/:attemptId/review", ctrl.reviewAttempt);
router.get("/attempts", ctrl.myAttempts);

module.exports = router;
