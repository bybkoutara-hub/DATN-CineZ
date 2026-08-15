import express from "express";
import { getGenres, getGenreById } from "../controllers/genreController";

const router = express.Router();

router.get("/", getGenres);
router.get("/:id", getGenreById);

export default router;
