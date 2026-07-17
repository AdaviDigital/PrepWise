const { verifyAccessToken } = require("../utils/jwt");
const { ApiError } = require("../utils/apiResponse");
const prisma = require("../config/db");

/**
 * Reads the access token from the Authorization header (Bearer) or the
 * `accessToken` httpOnly cookie, verifies it, and attaches `req.user`.
 */
function requireAuth() {
  return async function (req, res, next) {
    try {
      const header = req.headers.authorization || "";
      const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;
      const token = bearer || req.cookies?.accessToken;

      if (!token) throw new ApiError(401, "Authentication required. Please log in.");

      const payload = verifyAccessToken(token);

      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.isActive) {
        throw new ApiError(401, "Session is no longer valid. Please log in again.");
      }

      req.user = user;
      next();
    } catch (err) {
      if (err instanceof ApiError) return next(err);
      next(new ApiError(401, "Invalid or expired session. Please log in again."));
    }
  };
}

/** Restricts a route to one or more roles. Use after requireAuth(). */
function requireRole(...roles) {
  return function (req, res, next) {
    if (!req.user) return next(new ApiError(401, "Authentication required."));
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission to access this resource."));
    }
    next();
  };
}

/** Attaches req.user if a valid token is present, but never blocks the request. */
function optionalAuth() {
  return async function (req, res, next) {
    try {
      const header = req.headers.authorization || "";
      const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;
      const token = bearer || req.cookies?.accessToken;
      if (!token) return next();
      const payload = verifyAccessToken(token);
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (user && user.isActive) req.user = user;
      next();
    } catch {
      next();
    }
  };
}

module.exports = { requireAuth, requireRole, optionalAuth };
