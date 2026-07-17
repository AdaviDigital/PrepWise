const rateLimit = require("express-rate-limit");
const env = require("../config/env");

// General API traffic.
const apiLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: "Too many requests. Please slow down and try again shortly." } },
});

// Tighter limit on auth endpoints to blunt credential-stuffing/brute force.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: "Too many attempts. Please wait a few minutes and try again." } },
});

// AI tutor calls cost real money per request (OpenAI usage) — keep this strict
// and separately tunable from general API traffic.
const aiLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.aiMax,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { success: false, error: { message: "You have reached the AI tutor limit for now. Upgrade your plan or try again in a minute." } },
});

module.exports = { apiLimiter, authLimiter, aiLimiter };
