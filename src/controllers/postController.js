import sanitizeHtml from "sanitize-html";
import makeSlug from "../utils/slugify.js";
import prisma from "../lib/prisma.js";

// Public: list published posts with pagination
export const listPosts = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const per = Math.min(50, Number(req.query.per) || 10);
    const skip = (page - 1) * per;
    const where = { status: "published" };
    if (req.query.tag) where.tags = { has: req.query.tag };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip,
        take: per,
        include: { author: true },
      }),
      prisma.post.count({ where }),
    ]);

    res.json({ posts, total, page, per });
  } catch (err) {
    next(err);
  }
};

// Protected: list posts for authenticated author (include drafts)
export const listMyPosts = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const per = Math.min(200, Number(req.query.per) || 100);
    const skip = (page - 1) * per;

    const where = { authorId: req.user.id };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: per,
        include: { author: true },
      }),
      prisma.post.count({ where }),
    ]);

    res.json({ posts, total, page, per });
  } catch (err) {
    next(err);
  }
};

// Public: get single published post by slug
export const getPost = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const post = await prisma.post.findUnique({
      where: { slug },
      include: { author: true, comments: true },
    });

    if (!post || post.status !== "published")
      return res.status(404).json({ error: "Not found" });

    res.json(post);
  } catch (err) {
    next(err);
  }
};

// Protected: create post
export const createPost = async (req, res, next) => {
  try {
    const { title, excerpt, content, tags } = req.body;

    // Validate maximum word count
    const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount > 6000) {
      return res.status(400).json({ error: `Content must be at most 6000 words. Current: ${wordCount} words.` });
    }

    // Slug generation
    const slugBase = makeSlug(title);
    let slug = slugBase;
    let i = 1;
    while (await prisma.post.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${i++}`;
    }

    const sanitized = sanitizeHtml(content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        "img",
        "h1",
        "h2",
      ]),
    });

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        excerpt,
        content: sanitized,
        status: req.body.status || "draft",
        publishedAt: req.body.status === "published" ? new Date() : null,
        coverImage: req.file ? `/public/uploads/${req.file.filename}` : null,
        tags: tags
          ? tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        authorId: req.user.id,
      },
    });

    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

// Protected: update post
export const updatePost = async (req, res, next) => {
  try {
    const id = req.params.id;
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.authorId !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ error: "Forbidden" });

    // Validate maximum word count if content is being updated
    if (req.body.content) {
      const wordCount = req.body.content.trim().split(/\s+/).filter(w => w.length > 0).length;
      if (wordCount > 6000) {
        return res.status(400).json({ error: `Content must be at most 6000 words. Current: ${wordCount} words.` });
      }
    }

    const data = {};
    if (req.body.title) data.title = req.body.title;
    if (req.body.excerpt) data.excerpt = req.body.excerpt;
    if (req.body.content) data.content = sanitizeHtml(req.body.content);
    if (req.body.tags)
      data.tags = req.body.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    if (req.file) data.coverImage = `/public/uploads/${req.file.filename}`;

    const updated = await prisma.post.update({ where: { id }, data });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// Protected: publish/unpublish toggle
export const togglePublishPost = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { status } = req.body; // 'published' or 'draft'
    if (!["published", "draft", "archived"].includes(status))
      return res.status(400).json({ error: "Invalid status" });

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ error: "Not found" });
    if (post.authorId !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ error: "Forbidden" });

    const updated = await prisma.post.update({
      where: { id },
      data: { status, publishedAt: status === "published" ? new Date() : null },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// Protected: delete post
export const deletePost = async (req, res, next) => {
  try {
    const id = req.params.id;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ error: "Not found" });
    if (post.authorId !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ error: "Forbidden" });

    await prisma.post.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
