const prisma = require("../config/db");
const { asyncHandler, ok, ApiError } = require("../utils/apiResponse");

/** GET /api/dashboard/student — stats for the logged-in student */
const studentDashboard = asyncHandler(async (req, res) => {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: req.user.id },
    include: { badges: true },
  });
  const attempts = await prisma.cbtAttempt.findMany({
    where: { userId: req.user.id, status: "GRADED" },
    orderBy: { submittedAt: "desc" },
    take: 10,
    include: { cbtExam: { select: { title: true, examBody: true } } },
  });
  const activePlan = await prisma.studyPlan.findFirst({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { where: { isCompleted: false }, orderBy: { scheduledFor: "asc" }, take: 5 } },
  });

  const avgScore = attempts.length
    ? Math.round(
        (attempts.reduce((sum, a) => sum + (a.totalQuestions ? a.score / a.totalQuestions : 0), 0) / attempts.length) * 100
      )
    : 0;

  ok(res, {
    profile,
    stats: {
      points: profile?.points ?? 0,
      xp: profile?.xp ?? 0,
      streakDays: profile?.streakDays ?? 0,
      averageScore: avgScore,
      examsTaken: attempts.length,
    },
    recentAttempts: attempts,
    upcomingRevision: activePlan?.items || [],
  });
});

/** GET /api/dashboard/parent — aggregated view of all linked children */
const parentDashboard = asyncHandler(async (req, res) => {
  const parentProfile = await prisma.parentProfile.findUnique({
    where: { userId: req.user.id },
    include: {
      children: {
        include: {
          studentProfile: {
            include: { user: { select: { firstName: true, lastName: true } } },
          },
        },
      },
    },
  });
  if (!parentProfile) throw new ApiError(404, "Parent profile not found.");

  const children = await Promise.all(
    parentProfile.children.map(async (link) => {
      const sp = link.studentProfile;
      const attempts = await prisma.cbtAttempt.findMany({
        where: { userId: sp.userId, status: "GRADED" },
        orderBy: { submittedAt: "desc" },
        take: 5,
      });
      return {
        studentProfileId: sp.id,
        name: `${sp.user.firstName} ${sp.user.lastName}`,
        level: sp.level,
        classLabel: sp.classLabel,
        points: sp.points,
        streakDays: sp.streakDays,
        recentAttempts: attempts,
      };
    })
  );

  ok(res, { children });
});

/** GET /api/dashboard/teacher */
const teacherDashboard = asyncHandler(async (req, res) => {
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: req.user.id },
    include: { subjectsTaught: true },
  });
  const examsCreated = await prisma.cbtExam.count({ where: { createdById: req.user.id } });

  ok(res, {
    profile: teacherProfile,
    stats: { examsCreated, subjectsTaught: teacherProfile?.subjectsTaught?.length || 0 },
  });
});

/** GET /api/dashboard/school */
const schoolDashboard = asyncHandler(async (req, res) => {
  if (!req.user.schoolId) throw new ApiError(404, "No school is linked to this account.");
  const [studentCount, teacherCount, subjectCount] = await Promise.all([
    prisma.user.count({ where: { schoolId: req.user.schoolId, role: "STUDENT" } }),
    prisma.user.count({ where: { schoolId: req.user.schoolId, role: "TEACHER" } }),
    prisma.subject.count({ where: { schoolId: req.user.schoolId } }),
  ]);
  ok(res, { stats: { studentCount, teacherCount, subjectCount } });
});

module.exports = { studentDashboard, parentDashboard, teacherDashboard, schoolDashboard };
