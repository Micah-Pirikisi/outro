import "dotenv/config";
import express from "express";
import path from "path";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cors from "cors";
import rateLimit from "express-rate-limit";
import prisma from "./lib/prisma.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { mkdirSync } from "fs";

import expressEjsLayouts from "express-ejs-layouts";

import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postsRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import viewRoutes from "./routes/viewRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = join(process.cwd(), "public", "uploads");
mkdirSync(uploadsDir, { recursive: true });

// Trust proxy (Railway sets X-Forwarded-For header)
app.set("trust proxy", 1);

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrcAttr: ["'self'"],
      },
    },
  })
);
app.use(compression());
app.use(morgan("dev"));

// Serve static files BEFORE rate limiting
const publicDir = join(__dirname, "public");
const uploadsDir = join(process.cwd(), "public", "uploads");
app.use("/public", express.static(publicDir));
app.use("/uploads", express.static(uploadsDir));

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true })); // restrict in production

// Rate limiting (basic)
const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use(limiter);

// View engine configuration
app.use(expressEjsLayouts);
app.set("views", join(__dirname, "views"));
app.set("view engine", "ejs");
app.set("layout", "layout");

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
    res.status(err.status || 500).render("error", {
      title: "Error",
      error: err.message || "Internal server error",
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
