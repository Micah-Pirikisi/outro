import express from "express";
import {
  homePage,
  postPage,
  authorPage,
  aboutPage,
  tagPage,
} from "../controllers/viewController.js";

const router = express.Router();

// Public pages
router.get("/", homePage);
router.get("/post/:slug", postPage);
router.get("/about", aboutPage);
router.get("/tags/:tag", tagPage);

// Authoring SPA
router.get("/author", authorPage);

export default router;
