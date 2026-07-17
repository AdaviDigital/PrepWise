const router = require("express").Router();
const ctrl = require("../controllers/dashboard.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth());
router.get("/student", requireRole("STUDENT"), ctrl.studentDashboard);
router.get("/parent", requireRole("PARENT"), ctrl.parentDashboard);
router.get("/teacher", requireRole("TEACHER"), ctrl.teacherDashboard);
router.get("/school", requireRole("SCHOOL_ADMIN", "ADMIN"), ctrl.schoolDashboard);

module.exports = router;
