import { Router } from "express";
import { getUser, login, register } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = Router();

// Login route
router.post("/login", login);

// Register route
router.post("/register", register);
router.get("/user", protect, getUser);

export default router;
