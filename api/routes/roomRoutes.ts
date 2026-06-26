import express from "express";
import { getRoomByName, getRooms } from "../controllers/roomController";

const router = express.Router();

router.get("/", getRooms);
router.get("/:name", getRoomByName);

export default router;
