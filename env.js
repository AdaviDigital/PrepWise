require("dotenv").config();

function required(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;
  if (value === undefined && process.env.NODE_ENV === "production") {
    // Fail fast in production if a critical secret is missing.
    console.error(`[config] Missing required environment variable: ${name}`);
  }
  return value;
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "4000", 10),
  apiBaseUrl: process.env.API_BASE_URL || "http://localhost:4000",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5500",
  corsOrigins: (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),

  db: {
    url: required("DATABASE_URL"),
  },

  redisUrl: process.env.REDIS_URL || "",

  jwt: {
    accessSecret: required("JWT_ACCESS_SECRET", "dev_access_secret_change_me"),
    refreshSecret: required("JWT_REFRESH_SECRET", "dev_refresh_secret_change_me"),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },

  cookieSecret: process.env.COOKIE_SECRET || "dev_cookie_secret_change_me",

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  microsoft: {
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    tenantId: process.env.MICROSOFT_TENANT_ID || "common",
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    chatModel: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY,
    publicKey: process.env.PAYSTACK_PUBLIC_KEY,
  },
  flutterwave: {
    secretKey: process.env.FLUTTERWAVE_SECRET_KEY,
    publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },

  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || "PrepWise <no-reply@prepwise.ng>",
  },

  termii: {
    apiKey: process.env.TERMII_API_KEY,
    senderId: process.env.TERMII_SENDER_ID || "PrepWise",
  },

  whatsapp: {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
    aiMax: parseInt(process.env.AI_RATE_LIMIT_MAX || "20", 10),
  },
};
