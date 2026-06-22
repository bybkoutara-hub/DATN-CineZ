import express from "express";
import { getShowtimeById, getShowtimes } from "../controllers/showtimeController";

const router = express.Router();

router.get("/", getShowtimes);
router.get("/:id", getShowtimeById);

export default router;
