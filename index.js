const router = require("express").Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    data: {
      name: "PrepWise API",
      status: "healthy",
      docs: "See README.md for the full endpoint reference.",
    },
  });
});

router.use("/auth", require("./auth.routes"));
router.use("/ai", require("./ai.routes"));
router.use("/questions", require("./questions.routes"));
router.use("/exams", require("./exams.routes"));
router.use("/study-plans", require("./studyplan.routes"));
router.use("/payments", require("./payments.routes"));
router.use("/dashboard", require("./dashboard.routes"));
router.use("/uploads", require("./uploads.routes"));
router.use("/", require("./content.routes")); // /blog, /contact

module.exports = router;
