import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Home page (list of published posts)
export const homePage = async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      include: { author: true },
    });
    res.render("index", { posts });
  } catch (err) {
    next(err);
  }
};

// Single post page
export const postPage = async (req, res, next) => {
  try {
    const post = await prisma.post.findUnique({
      where: { slug: req.params.slug },
      include: { author: true, comments: true },
    });

    if (!post || post.status !== "published")
      return res.status(404).render("404");

    // only show approved comments
    const comments = post.comments.filter((c) => c.approved);

    res.render("post", { post, comments });
  } catch (err) {
    next(err);
  }
};

// Authoring SPA page
export const authorPage = (req, res) => {
  res.render("author");
};
