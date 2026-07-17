// Wraps an async route handler so rejected promises reach Express's error
// middleware instead of crashing the process. (express-async-errors also
// patches this globally, but the explicit wrapper keeps intent obvious.)
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function ok(res, data, meta = undefined, status = 200) {
  return res.status(status).json({ success: true, data, ...(meta ? { meta } : {}) });
}

function created(res, data) {
  return ok(res, data, undefined, 201);
}

class ApiError extends Error {
  constructor(status, message, details = undefined) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

module.exports = { asyncHandler, ok, created, ApiError };
