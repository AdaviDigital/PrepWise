const router = require("express").Router();
const ctrl = require("../controllers/content.controller");
const { validateBody } = require("../middleware/validate");
const { contactSchema } = require("../utils/schemas");

router.get("/blog", ctrl.listPosts);
router.get("/blog/:slug", ctrl.getPost);
router.post("/contact", validateBody(contactSchema), ctrl.submitContact);

module.exports = router;
