import express from "express";
import {
  homePage,
  postPage,
  authorPage,
} from "../controllers/viewController.js";

const router = express.Router();

// Public pages
router.get("/", homePage);
router.get("/post/:slug", postPage);

// Authoring SPA
router.get("/author", authorPage);

export default router;
