import express from "express";
import multer from "multer";
import path from "path";
import { body } from "express-validator";
import auth from "../middleware/auth.js";
import {
  listPosts,
  getPost,
  getPostById,
  createPost,
  updatePost,
  togglePublishPost,
  deletePost,
  listMyPosts,
} from "../controllers/postController.js";

const router = express.Router();

// Multer setup for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(process.cwd(), "public", "uploads")),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-")),
});

const fileFilter = (req, file, cb) => {
  // Allow images for coverImage and PDFs for document
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}`), false);
  }
};

const upload = multer({ storage, fileFilter });

// Public routes
router.get("/", listPosts);
router.get("/me", auth, listMyPosts);
// allow authors to fetch by id (for editing) — protected
router.get("/id/:id", auth, getPostById);
router.get("/:slug", getPost);

// Protected routes
router.post(
  "/",
  auth,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "document", maxCount: 1 },
  ]),
  body("title").isLength({ min: 3 }),
  body("content").isLength({ min: 10 }),
  createPost,
);

router.put(
  "/:id",
  auth,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "document", maxCount: 1 },
  ]),
  updatePost,
);
router.patch("/:id/publish", auth, togglePublishPost);
router.delete("/:id", auth, deletePost);

export default router;
