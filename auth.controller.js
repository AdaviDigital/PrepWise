const { OAuth2Client } = require("google-auth-library");
const prisma = require("../config/db");
const env = require("../config/env");
const { hashPassword, comparePassword, isStrongPassword } = require("../utils/password");
const { signAccessToken, signRefreshToken, verifyRefreshToken, hashToken } = require("../utils/jwt");
const { asyncHandler, ok, created, ApiError } = require("../utils/apiResponse");

const googleClient = env.google.clientId ? new OAuth2Client(env.google.clientId) : null;

const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "lax",
  path: "/api/auth",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};
const ACCESS_COOKIE_OPTS = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "lax",
  maxAge: 15 * 60 * 1000, // 15 minutes
};

function publicUser(user) {
  const { passwordHash, twoFactorSecret, ...safe } = user;
  return safe;
}

async function issueSession(res, user, req) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      userAgent: req.headers["user-agent"] || null,
      ipAddress: req.ip,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTS);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTS);

  return { accessToken, refreshToken };
}

/** POST /api/auth/register */
const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role, phone, level } = req.body;

  if (!isStrongPassword(password)) {
    throw new ApiError(422, "Password must be at least 8 characters and include a letter and a number.");
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) throw new ApiError(409, "An account with this email already exists. Try logging in instead.");

  const passwordHash = await hashPassword(password);
  const allowedRoles = ["STUDENT", "PARENT", "TEACHER"]; // SCHOOL_ADMIN/ADMIN are provisioned internally
  const finalRole = allowedRoles.includes(role) ? role : "STUDENT";

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      role: finalRole,
      ...(finalRole === "STUDENT"
        ? { studentProfile: { create: { level: level || "SECONDARY" } } }
        : {}),
      ...(finalRole === "TEACHER" ? { teacherProfile: { create: {} } } : {}),
      ...(finalRole === "PARENT" ? { parentProfile: { create: {} } } : {}),
    },
  });

  await prisma.subscription.create({ data: { userId: user.id, plan: "FREE", status: "ACTIVE" } });

  const { accessToken, refreshToken } = await issueSession(res, user, req);
  created(res, { user: publicUser(user), accessToken, refreshToken });
});

/** POST /api/auth/login */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email: (email || "").toLowerCase() } });
  const validPassword = user ? await comparePassword(password, user.passwordHash) : false;

  if (!user || !validPassword) {
    throw new ApiError(401, "Incorrect email or password.");
  }
  if (!user.isActive) throw new ApiError(403, "This account has been deactivated. Contact support.");

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const { accessToken, refreshToken } = await issueSession(res, user, req);
  ok(res, { user: publicUser(user), accessToken, refreshToken });
});

/** POST /api/auth/google  { idToken } */
const googleLogin = asyncHandler(async (req, res) => {
  if (!googleClient) throw new ApiError(501, "Google sign-in is not configured on this server yet.");
  const { idToken } = req.body;
  const ticket = await googleClient.verifyIdToken({ idToken, audience: env.google.clientId });
  const payload = ticket.getPayload();

  let user = await prisma.user.findUnique({ where: { googleId: payload.sub } });
  if (!user) {
    user = await prisma.user.findUnique({ where: { email: payload.email.toLowerCase() } });
    if (user) {
      user = await prisma.user.update({ where: { id: user.id }, data: { googleId: payload.sub } });
    } else {
      user = await prisma.user.create({
        data: {
          email: payload.email.toLowerCase(),
          firstName: payload.given_name || "Student",
          lastName: payload.family_name || "",
          googleId: payload.sub,
          avatarUrl: payload.picture,
          isEmailVerified: true,
          role: "STUDENT",
          studentProfile: { create: {} },
        },
      });
      await prisma.subscription.create({ data: { userId: user.id, plan: "FREE", status: "ACTIVE" } });
    }
  }

  const { accessToken, refreshToken } = await issueSession(res, user, req);
  ok(res, { user: publicUser(user), accessToken, refreshToken });
});

/** POST /api/auth/microsoft { accessToken: msGraphToken } — validated via Graph /me */
const microsoftLogin = asyncHandler(async (req, res) => {
  const { accessToken: msToken } = req.body;
  if (!msToken) throw new ApiError(400, "Missing Microsoft access token.");

  const graphRes = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${msToken}` },
  });
  if (!graphRes.ok) throw new ApiError(401, "Could not verify Microsoft account.");
  const profile = await graphRes.json();
  const email = (profile.mail || profile.userPrincipalName || "").toLowerCase();
  if (!email) throw new ApiError(400, "Microsoft account has no accessible email address.");

  let user = await prisma.user.findUnique({ where: { microsoftId: profile.id } });
  if (!user) {
    user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      user = await prisma.user.update({ where: { id: user.id }, data: { microsoftId: profile.id } });
    } else {
      user = await prisma.user.create({
        data: {
          email,
          firstName: profile.givenName || "Student",
          lastName: profile.surname || "",
          microsoftId: profile.id,
          isEmailVerified: true,
          role: "STUDENT",
          studentProfile: { create: {} },
        },
      });
      await prisma.subscription.create({ data: { userId: user.id, plan: "FREE", status: "ACTIVE" } });
    }
  }

  const { accessToken, refreshToken } = await issueSession(res, user, req);
  ok(res, { user: publicUser(user), accessToken, refreshToken });
});

/** POST /api/auth/refresh */
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) throw new ApiError(401, "No refresh token provided.");

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, "Refresh token is invalid or expired. Please log in again.");
  }

  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new ApiError(401, "Session has been revoked. Please log in again.");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) throw new ApiError(401, "Account no longer available.");

  // Rotate: revoke the old refresh token and issue a new pair.
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
  const { accessToken, refreshToken } = await issueSession(res, user, req);

  ok(res, { accessToken, refreshToken });
});

/** POST /api/auth/logout */
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    await prisma.refreshToken
      .updateMany({ where: { tokenHash: hashToken(token) }, data: { revokedAt: new Date() } })
      .catch(() => {});
  }
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken", { path: "/api/auth" });
  ok(res, { loggedOut: true });
});

/** GET /api/auth/me */
const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { studentProfile: true, teacherProfile: true, parentProfile: true, subscriptions: { orderBy: { startedAt: "desc" }, take: 1 } },
  });
  ok(res, { user: publicUser(user) });
});

module.exports = { register, login, googleLogin, microsoftLogin, refresh, logout, me };
