import "dotenv/config";
import express from "express";
import path from "path";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import authRoutes from "./controllers/auth.js";
import postRoutes from "./controllers/posts.js";
import commentRoutes from "./controllers/comments.js";
import viewRoutes from "./controllers/views.js";

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true })); // restrict in production
app.use("/public", express.static(join(__dirname, "..", "public")));

// Rate limiting (basic)
const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use(limiter);

// View engine
app.set("views", join(__dirname, "views"));
app.set("view engine", "ejs");

// API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/comments", commentRoutes);

// Public views (Reader)
app.use("/", viewRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (req.path.startsWith("/api/")) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Internal server error" });
  } else {
    res
      .status(err.status || 500)
      .render("error", { error: err.message || "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
