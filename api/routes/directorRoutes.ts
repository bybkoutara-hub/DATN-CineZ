import express from "express";
import { getDirectors, getDirectorById } from "../controllers/directorController";

const router = express.Router();

router.get("/", getDirectors);
router.get("/:id", getDirectorById);

export default router;
