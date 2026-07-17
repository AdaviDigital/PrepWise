const router = require("express").Router();
const multer = require("multer");
const ctrl = require("../controllers/uploads.controller");
const { requireAuth } = require("../middleware/auth");

// Memory storage — files are streamed straight to Cloudinary, never written
// to local disk (important on ephemeral hosts like Render/Cloud Run).
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

router.post("/", requireAuth(), upload.single("file"), ctrl.uploadFile);

module.exports = router;
