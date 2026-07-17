const router = require("express").Router();
const ctrl = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimit");
const { validateBody } = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../utils/schemas");

router.post("/register", authLimiter, validateBody(registerSchema), ctrl.register);
router.post("/login", authLimiter, validateBody(loginSchema), ctrl.login);
router.post("/google", authLimiter, ctrl.googleLogin);
router.post("/microsoft", authLimiter, ctrl.microsoftLogin);
router.post("/refresh", authLimiter, ctrl.refresh);
router.post("/logout", ctrl.logout);
router.get("/me", requireAuth(), ctrl.me);

module.exports = router;
