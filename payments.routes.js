const router = require("express").Router();
const ctrl = require("../controllers/payments.controller");
const { requireAuth } = require("../middleware/auth");
const { validateBody } = require("../middleware/validate");
const { paymentInitSchema } = require("../utils/schemas");

// NOTE: the raw-body webhook route (/api/payments/paystack/webhook) is
// mounted directly in app.js, BEFORE express.json(), so the exact request
// bytes are available for HMAC signature verification. Do not add it here.

router.use(requireAuth());
router.post("/paystack/init", validateBody(paymentInitSchema), ctrl.initPaystack);
router.get("/paystack/verify/:reference", ctrl.verifyPaystack);
router.post("/flutterwave/init", validateBody(paymentInitSchema), ctrl.initFlutterwave);

module.exports = router;
