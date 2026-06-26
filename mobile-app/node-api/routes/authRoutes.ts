// mobile-app/node-api/routes/authRoutes.ts
import express from "express";
import { getProfile, login, register } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", verifyToken, getProfile); // Endpoint này được bảo vệ bởi verifyToken

export default router;