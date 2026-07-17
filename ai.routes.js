const router = require("express").Router();
const ctrl = require("../controllers/ai.controller");
const { requireAuth } = require("../middleware/auth");
const { aiLimiter } = require("../middleware/rateLimit");
const { validateBody } = require("../middleware/validate");
const { aiMessageSchema } = require("../utils/schemas");

router.use(requireAuth());

router.post("/sessions", ctrl.createSession);
router.get("/sessions", ctrl.listSessions);
router.get("/sessions/:id", ctrl.getSession);
router.post("/sessions/:id/messages", aiLimiter, validateBody(aiMessageSchema), ctrl.sendMessage);
router.post("/homework", aiLimiter, ctrl.solveHomework);
router.post("/questions/:id/explain", aiLimiter, ctrl.explainQuestion);

module.exports = router;
