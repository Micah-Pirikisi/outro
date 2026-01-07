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

    // Prepare content: remove duplicated leading title/author if author inserted them into content
    let displayContent = post.content || "";
    const title = post.title || "";
    const authorName = post.author?.name || post.author?.email || "";

    // Remove leading HTML heading that matches the title
    try {
      const h1Regex = new RegExp('^\\s*<h1[^>]*>\\s*' + escapeRegExp(title) + '\\s*</h1>', 'i');
      if (h1Regex.test(displayContent)) displayContent = displayContent.replace(h1Regex, '');
        // Remove a plain text title at start
        const plainTitleRegex = new RegExp('^\\s*' + escapeRegExp(title) + '\\s*', 'i');
        if (plainTitleRegex.test(displayContent)) displayContent = displayContent.replace(plainTitleRegex, '');
        // Remove leading "by Author" lines
        if (authorName) {
          const byAuthorRegex = new RegExp('^\\s*(by\\s+' + escapeRegExp(authorName) + ')[\\s\\S]{0,200}?', 'i');
          displayContent = displayContent.replace(byAuthorRegex, '');
        }
        // Remove any duplicated title that appears again near the start of the content
        try {
          const prefix = displayContent.slice(0, 300).toLowerCase();
          if (title && prefix.includes(title.toLowerCase())) {
            const dupRegex = new RegExp(escapeRegExp(title), 'i');
            displayContent = displayContent.replace(dupRegex, '');
          }
        } catch (e) {
          // ignore
        }
    } catch (e) {
      // if any regex fails, fall back to original content
      displayContent = post.content;
    }

    res.render("post", { title: post.title, post, comments, content: displayContent });
  } catch (err) {
    next(err);
  }
};

// helper to escape string for regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
}

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
    const tagLabels = {
      novel: "Novels",
      script: "Scripts",
      poetry: "Poetry",
      "short-story": "Short Stories",
    };
    const displayTag = tagLabels[tag] || tag.charAt(0).toUpperCase() + tag.slice(1);
    const posts = await prisma.post.findMany({
      where: { status: "published", tags: { has: tag } },
      orderBy: { publishedAt: "desc" },
      include: { author: true },
    });
    res.render("tag", {
      title: displayTag,
      posts,
      tag: displayTag,
    });
  } catch (err) {
    next(err);
  }
};
