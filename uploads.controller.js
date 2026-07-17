const cloudinaryService = require("../services/cloudinary.service");
const { asyncHandler, created, ApiError } = require("../utils/apiResponse");

/** POST /api/uploads  (multipart/form-data, field name "file") */
const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(422, "No file was uploaded.");

  const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!allowed.includes(req.file.mimetype)) {
    throw new ApiError(422, "Only JPG, PNG, WEBP images or PDF files are accepted.");
  }
  if (req.file.size > 15 * 1024 * 1024) {
    throw new ApiError(422, "File is too large. Maximum size is 15MB.");
  }

  const result = await cloudinaryService.uploadBuffer(req.file.buffer, {
    folder: `prepwise/${req.user.role.toLowerCase()}/${req.user.id}`,
  });

  created(res, { url: result.secure_url, publicId: result.public_id, resourceType: result.resource_type });
});

module.exports = { uploadFile };
