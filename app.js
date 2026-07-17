require("express-async-errors");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const env = require("./config/env");
const { apiLimiter } = require("./middleware/rateLimit");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");
const routes = require("./routes");
const webhookRoutes = require("./routes/webhook.routes");

const app = express();

// Render/Cloudflare/Vercel sit in front of the app as a reverse proxy —
// trust the first hop so req.ip and secure cookies behave correctly.
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: false, // the API returns JSON only; CSP is enforced on the static frontend
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const allowedOrigins = new Set([env.frontendUrl, ...env.corsOrigins].filter(Boolean));
app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin/non-browser requests (no Origin header) and
      // anything explicitly listed in CORS_ORIGINS / FRONTEND_URL.
      if (!origin || allowedOrigins.size === 0 || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// IMPORTANT: the Paystack webhook needs the raw request body for signature
// verification, so it's mounted before express.json() strips/parses it.
app.use("/api/payments", webhookRoutes);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(env.cookieSecret));

if (env.nodeEnv !== "test") {
  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
}

app.use("/api", apiLimiter);

app.get("/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
