import prisma from "../lib/prisma.js";
import sanitizeHtml from "sanitize-html";

// Create comment (public)
export const createComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { author, email, body } = req.body;

    if (!body || body.length < 2)
      return res.status(400).json({ error: "Comment body required" });

    // Verify post exists (postId is the slug from URL)
    const post = await prisma.post.findUnique({ where: { slug: postId } });
    if (!post) return res.status(404).json({ error: "Post not found" });

    const sanitized = sanitizeHtml(body, {
      allowedTags: [],
      allowedAttributes: {},
    });

    const comment = await prisma.comment.create({
      data: { postId: post.id, author, email, body: sanitized, approved: false },
    });

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};

// Approve comment (protected)
export const approveComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: { post: true },
    });

    if (!comment) return res.status(404).json({ error: "Not found" });

    const post = await prisma.post.findUnique({
      where: { id: comment.postId },
    });

    if (req.user.id !== post.authorId && req.user.role !== "admin")
      return res.status(403).json({ error: "Forbidden" });

    const updated = await prisma.comment.update({
      where: { id },
      data: { approved: true },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// Delete comment (protected)
export const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: { post: true },
    });

    if (!comment) return res.status(404).json({ error: "Not found" });

    const post = await prisma.post.findUnique({
      where: { id: comment.postId },
    });

    if (req.user.id !== post.authorId && req.user.role !== "admin")
      return res.status(403).json({ error: "Forbidden" });

    await prisma.comment.delete({ where: { id } });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// Get pending comments (protected)
export const getPendingComments = async (req, res, next) => {
  try {
    // Get all posts by this user
    const userPosts = await prisma.post.findMany({
      where: { authorId: req.user.id },
      select: { id: true },
    });

    const postIds = userPosts.map((p) => p.id);

    // Get all unapproved comments on those posts
    const comments = await prisma.comment.findMany({
      where: {
        postId: { in: postIds },
        approved: false,
      },
      include: { post: { select: { title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json({ comments });
  } catch (err) {
    next(err);
  }
};
