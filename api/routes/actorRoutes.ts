import express from "express";
import { getActors, getActorById } from "../controllers/actorController";

const router = express.Router();

router.get("/", getActors);
router.get("/:id", getActorById);

export default router;
