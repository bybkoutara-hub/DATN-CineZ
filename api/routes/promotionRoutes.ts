import express from "express";
import { applyPromo, getPromotions } from "../controllers/promotionController";

const router = express.Router();

router.get("/", getPromotions);
router.post("/apply", applyPromo);

export default router;
