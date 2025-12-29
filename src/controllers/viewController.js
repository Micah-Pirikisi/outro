import prisma from "../lib/prisma.js";

// Home page (list of published posts)
export const homePage = async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      include: { author: true },
    });
    res.render("index", { title: "Home", posts });
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
      return res.status(404).render("404", { title: "Not Found" });

    // only show approved comments
    const comments = post.comments.filter((c) => c.approved);

    res.render("post", { title: post.title, post, comments });
  } catch (err) {
    next(err);
  }
};

// Authoring SPA page
export const authorPage = (req, res) => {
  res.render("author", { title: "Author" });
};

// About page
export const aboutPage = (req, res) => {
  res.render("about", { title: "About" });
};

// Tag listing page (e.g., /tags/novel)
export const tagPage = async (req, res, next) => {
  try {
    const tag = req.params.tag;
    const posts = await prisma.post.findMany({
      where: { status: "published", tags: { has: tag } },
      orderBy: { publishedAt: "desc" },
      include: { author: true },
    });
    res.render("tag", {
      title: tag.charAt(0).toUpperCase() + tag.slice(1),
      posts,
      tag,
    });
  } catch (err) {
    next(err);
  }
};
