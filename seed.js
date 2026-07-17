/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding PrepWise database...");

  // ── Admin account ────────────────────────────────────────────────────
  const adminEmail = "admin@prepwise.ng";
  const adminPasswordHash = await bcrypt.hash("ChangeMe123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      firstName: "PrepWise",
      lastName: "Admin",
      role: "ADMIN",
      passwordHash: adminPasswordHash,
      isEmailVerified: true,
    },
  });
  console.log(`Admin ready: ${adminEmail} / ChangeMe123! (change this immediately)`);

  // ── Subjects ─────────────────────────────────────────────────────────
  const subjectDefs = [
    { name: "Mathematics", level: "SECONDARY" },
    { name: "English Language", level: "SECONDARY" },
    { name: "Physics", level: "SECONDARY" },
    { name: "Chemistry", level: "SECONDARY" },
    { name: "Biology", level: "SECONDARY" },
    { name: "Economics", level: "SECONDARY" },
    { name: "Government", level: "SECONDARY" },
    { name: "Geography", level: "SECONDARY" },
    { name: "Agricultural Science", level: "SECONDARY" },
    { name: "Commerce", level: "SECONDARY" },
    { name: "Accounting", level: "SECONDARY" },
    { name: "Literature in English", level: "SECONDARY" },
    { name: "Christian Religious Studies", level: "SECONDARY" },
    { name: "Islamic Religious Studies", level: "SECONDARY" },
    { name: "Computer Studies", level: "SECONDARY" },
    { name: "Civic Education", level: "SECONDARY" },
    { name: "History", level: "SECONDARY" },
    { name: "French", level: "SECONDARY" },
    { name: "Yoruba", level: "SECONDARY" },
    { name: "Igbo", level: "SECONDARY" },
    { name: "Hausa", level: "SECONDARY" },
    { name: "Mathematics", level: "PRIMARY" },
    { name: "English Studies", level: "PRIMARY" },
    { name: "Basic Science", level: "PRIMARY" },
  ];

  const subjects = {};
  for (const s of subjectDefs) {
    const slug = `${s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${s.level.toLowerCase()}`;
    const subject = await prisma.subject.upsert({
      where: { slug },
      update: {},
      create: { name: s.name, slug, level: s.level },
    });
    subjects[slug] = subject;
  }
  console.log(`Seeded ${subjectDefs.length} subjects.`);

  // ── Sample WAEC Mathematics questions ───────────────────────────────
  const mathSlug = "mathematics-secondary";
  const topic = await prisma.topic.create({
    data: { subjectId: subjects[mathSlug].id, name: "Simultaneous Equations" },
  });

  const sampleQuestions = [
    {
      prompt: "Solve for x and y: 2x + y = 7, x - y = 2",
      options: [
        { key: "A", text: "x=3, y=1" },
        { key: "B", text: "x=2, y=3" },
        { key: "C", text: "x=1, y=5" },
        { key: "D", text: "x=4, y=-1" },
      ],
      correctKey: "A",
      explanation: "Adding both equations eliminates... x=3, y=1 satisfies both original equations.",
    },
    {
      prompt: "Simplify: (3x²y)(2xy³)",
      options: [
        { key: "A", text: "6x³y⁴" },
        { key: "B", text: "5x³y⁴" },
        { key: "C", text: "6x²y³" },
        { key: "D", text: "5xy" },
      ],
      correctKey: "A",
      explanation: "Multiply coefficients (3×2=6) and add powers of like variables: x^(2+1)=x³, y^(1+3)=y⁴.",
    },
    {
      prompt: "The angles of a triangle are in the ratio 2:3:4. Find the largest angle.",
      options: [
        { key: "A", text: "40°" },
        { key: "B", text: "60°" },
        { key: "C", text: "80°" },
        { key: "D", text: "100°" },
      ],
      correctKey: "C",
      explanation: "Sum of ratios = 9. Largest angle = (4/9) × 180° = 80°.",
    },
  ];

  const createdQuestions = [];
  for (const q of sampleQuestions) {
    const question = await prisma.question.create({
      data: {
        subjectId: subjects[mathSlug].id,
        topicId: topic.id,
        examBody: "WAEC",
        examYear: 2024,
        difficulty: "MEDIUM",
        prompt: q.prompt,
        options: q.options,
        correctKey: q.correctKey,
        explanation: q.explanation,
      },
    });
    createdQuestions.push(question);
  }
  console.log(`Seeded ${createdQuestions.length} sample WAEC Mathematics questions.`);

  // ── Demo CBT exam built from those questions ────────────────────────
  await prisma.cbtExam.create({
    data: {
      title: "WAEC Mathematics Practice — Algebra & Geometry",
      examBody: "WAEC",
      subjectId: subjects[mathSlug].id,
      durationMinutes: 20,
      totalMarks: createdQuestions.length,
      createdById: admin.id,
      questions: {
        create: createdQuestions.map((q, i) => ({ questionId: q.id, order: i })),
      },
    },
  });
  console.log("Seeded a demo CBT exam.");

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
