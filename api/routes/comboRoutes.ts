import express from "express";
import { addCombo, getCombos } from "../controllers/comboController";

const router = express.Router();

router.get("/", getCombos);
router.post("/", addCombo);

export default router;
