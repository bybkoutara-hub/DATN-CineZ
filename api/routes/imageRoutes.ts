import express from "express";
import { proxyImage } from "../controllers/imageController";

const router = express.Router();

router.get("/proxy", proxyImage);

export default router;
