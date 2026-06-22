import express from "express";
import { addCinema, getCinemaById, getCinemas } from "../controllers/cinemaController";

const router = express.Router();

router.get("/", getCinemas);
router.get("/:id", getCinemaById);
router.post("/", addCinema);

export default router;
