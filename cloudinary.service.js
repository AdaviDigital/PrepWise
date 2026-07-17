const cloudinary = require("cloudinary").v2;
const env = require("../config/env");

if (env.cloudinary.cloudName) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
}

/** Uploads a buffer (from multer's memory storage) to Cloudinary. */
function uploadBuffer(buffer, { folder = "prepwise/uploads", resourceType = "auto" } = {}) {
  return new Promise((resolve, reject) => {
    if (!env.cloudinary.cloudName) {
      return reject(new Error("Cloudinary is not configured. Set CLOUDINARY_* env vars."));
    }
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });
}

module.exports = { uploadBuffer, cloudinary };
