const { v4: uuid } = require("uuid");
const prisma = require("../config/db");
const env = require("../config/env");
const paystack = require("../services/paystack.service");
const flutterwave = require("../services/flutterwave.service");
const { asyncHandler, ok, ApiError } = require("../utils/apiResponse");

const PLAN_PRICES_KOBO = {
  BASIC: 200000, // ₦2,000
  PREMIUM: 450000, // ₦4,500
  SCHOOL: null, // custom/contact sales
};

/** POST /api/payments/paystack/init  { plan } */
const initPaystack = asyncHandler(async (req, res) => {
  const { plan } = req.body;
  const amountKobo = PLAN_PRICES_KOBO[plan];
  if (!amountKobo) throw new ApiError(422, "Select a valid paid plan (BASIC or PREMIUM).");

  const reference = `pw_${uuid()}`;

  await prisma.payment.create({
    data: {
      userId: req.user.id,
      provider: "PAYSTACK",
      reference,
      amountKobo,
      status: "PENDING",
      metadata: { plan },
    },
  });

  const data = await paystack.initializeTransaction({
    email: req.user.email,
    amountKobo,
    reference,
    metadata: { plan, userId: req.user.id },
    callbackUrl: `${env.frontendUrl}/pricing.html?payment=callback`,
  });

  ok(res, { authorizationUrl: data.authorization_url, reference });
});

/** GET /api/payments/paystack/verify/:reference — called by the frontend after redirect back */
const verifyPaystack = asyncHandler(async (req, res) => {
  const { reference } = req.params;
  const payment = await prisma.payment.findUnique({ where: { reference } });
  if (!payment) throw new ApiError(404, "Payment record not found.");

  const data = await paystack.verifyTransaction(reference);
  const success = data.status === "success";

  await activatePaymentIfNeeded(payment, success, data);
  ok(res, { status: success ? "SUCCESS" : "FAILED" });
});

/**
 * POST /api/payments/paystack/webhook
 * Mounted with a raw-body parser (see routes) so the HMAC signature can be
 * verified against the exact bytes Paystack sent. This is the source of
 * truth for activating subscriptions — never trust the client redirect alone.
 */
const paystackWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-paystack-signature"];
  const valid = paystack.verifyWebhookSignature(req.rawBody, signature);
  if (!valid) throw new ApiError(401, "Invalid webhook signature.");

  const event = req.body;
  if (event.event === "charge.success") {
    const reference = event.data.reference;
    const payment = await prisma.payment.findUnique({ where: { reference } });
    if (payment) await activatePaymentIfNeeded(payment, true, event.data);
  }

  res.status(200).send("ok");
});

/** POST /api/payments/flutterwave/init { plan } */
const initFlutterwave = asyncHandler(async (req, res) => {
  const { plan } = req.body;
  const amountKobo = PLAN_PRICES_KOBO[plan];
  if (!amountKobo) throw new ApiError(422, "Select a valid paid plan (BASIC or PREMIUM).");

  const txRef = `pw_${uuid()}`;
  await prisma.payment.create({
    data: {
      userId: req.user.id,
      provider: "FLUTTERWAVE",
      reference: txRef,
      amountKobo,
      status: "PENDING",
      metadata: { plan },
    },
  });

  const data = await flutterwave.initializePayment({
    email: req.user.email,
    amountNaira: amountKobo / 100,
    txRef,
    redirectUrl: `${env.frontendUrl}/pricing.html?payment=callback`,
    metadata: { plan, userId: req.user.id },
  });

  ok(res, { paymentLink: data.link, reference: txRef });
});

async function activatePaymentIfNeeded(payment, success, providerData) {
  if (payment.status === "SUCCESS") return; // idempotent — webhook + verify can both fire
  if (!success) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED", metadata: providerData } });
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({ where: { id: payment.id }, data: { status: "SUCCESS", metadata: providerData } });

    const plan = payment.metadata?.plan || "BASIC";
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const existing = await tx.subscription.findFirst({
      where: { userId: payment.userId },
      orderBy: { startedAt: "desc" },
    });

    if (existing) {
      await tx.subscription.update({
        where: { id: existing.id },
        data: { plan, status: "ACTIVE", currentPeriodEnd: periodEnd, cancelAtPeriodEnd: false },
      });
    } else {
      await tx.subscription.create({
        data: { userId: payment.userId, plan, status: "ACTIVE", currentPeriodEnd: periodEnd },
      });
    }
  });
}

module.exports = { initPaystack, verifyPaystack, paystackWebhook, initFlutterwave };
