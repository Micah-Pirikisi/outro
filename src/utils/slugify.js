const slugify = require("slugify");

module.exports = function makeSlug(text) {
  const base = slugify(text || "", { lower: true, strict: true });
  return base || Math.random().toString(36).slice(2, 8);
};
