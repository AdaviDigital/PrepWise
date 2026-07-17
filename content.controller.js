const prisma = require("../config/db");
const { asyncHandler, ok, created, ApiError } = require("../utils/apiResponse");
const { notify } = require("../services/notification.service");

/** GET /api/blog?tag=&page=&limit= */
const listPosts = asyncHandler(async (req, res) => {
  const { tag, page = "1", limit = "9" } = req.query;
  const take = Math.min(parseInt(limit, 10) || 9, 30);
  const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

  const where = { isPublished: true, ...(tag ? { tags: { has: tag } } : {}) };
  const [items, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip,
      take,
      select: { id: true, title: true, slug: true, excerpt: true, coverImageUrl: true, tags: true, publishedAt: true },
    }),
    prisma.blogPost.count({ where }),
  ]);
  ok(res, { items }, { total, page: Number(page), pages: Math.ceil(total / take) });
});

/** GET /api/blog/:slug */
const getPost = asyncHandler(async (req, res) => {
  const post = await prisma.blogPost.findUnique({
    where: { slug: req.params.slug },
    include: { author: { select: { firstName: true, lastName: true, avatarUrl: true } } },
  });
  if (!post || !post.isPublished) throw new ApiError(404, "Article not found.");
  ok(res, { post });
});

/** POST /api/contact  { name, email, subject, message } — public endpoint, no auth required */
const submitContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message, userId } = req.body;
  if (!name || !email || !message) throw new ApiError(422, "Please fill in your name, email and message.");

  const ticket = await prisma.supportTicket.create({
    data: { name, email, subject: subject || "General enquiry", message, userId: userId || undefined },
  });

  // Notify the PrepWise support inbox (best-effort; failures don't block the user's submission).
  notify({
    userId: userId || ticket.id,
    channel: "EMAIL",
    title: `New contact form submission: ${ticket.subject}`,
    body: `${name} (${email}) wrote: ${message}`,
    to: "olatundeajayi87@yahoo.com",
  }).catch(() => {});

  created(res, { ticketId: ticket.id });
});

module.exports = { listPosts, getPost, submitContact };
