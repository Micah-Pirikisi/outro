import slugify from "slugify";

export default function makeSlug(str) {
  return slugify(str, {
    lower: true,
    strict: true,
    trim: true,
  });
}
