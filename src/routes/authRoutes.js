import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

// Register (for initial setup; restrict in production)
router.post("/register", register);

// Login
router.post("/login", login);

export default router;
