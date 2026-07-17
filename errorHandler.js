const { ApiError } = require("../utils/apiResponse");

function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const isApiError = err instanceof ApiError;
  const status = isApiError ? err.status : err.status || 500;

  if (!isApiError) {
    // Unexpected errors are logged with full detail server-side but never
    // leaked to the client in production.
    console.error("[unhandled error]", err);
  }

  const payload = {
    success: false,
    error: {
      message: status === 500 && process.env.NODE_ENV === "production"
        ? "Something went wrong on our end. Please try again shortly."
        : err.message,
    },
  };

  if (isApiError && err.details) payload.error.details = err.details;

  res.status(status).json(payload);
}

module.exports = { notFoundHandler, errorHandler };
