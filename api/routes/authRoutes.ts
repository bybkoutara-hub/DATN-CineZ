import express from "express";
import { getMe, login, register } from "../controllers/authController";
import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

export default router;
