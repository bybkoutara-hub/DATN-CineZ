"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cinemaController_1 = require("../controllers/cinemaController");
const router = express_1.default.Router();
router.get("/", cinemaController_1.getCinemas);
router.get("/:id", cinemaController_1.getCinemaById);
router.post("/", cinemaController_1.addCinema);
exports.default = router;
//# sourceMappingURL=cinemaRoutes.js.map