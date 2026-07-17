const { ApiError } = require("../utils/apiResponse");

/**
 * Validates req.body against a Zod schema. On failure, responds with 422
 * and a field-level breakdown so the frontend can highlight exact fields.
 */
function validateBody(schema) {
  return function (req, res, next) {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return next(new ApiError(422, "Please check the highlighted fields and try again.", details));
    }
    req.body = result.data;
    next();
  };
}

module.exports = { validateBody };
