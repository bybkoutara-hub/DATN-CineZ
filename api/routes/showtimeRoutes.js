"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const showtimeController_1 = require("../controllers/showtimeController");
const router = express_1.default.Router();
router.get("/", showtimeController_1.getShowtimes);
router.get("/:id", showtimeController_1.getShowtimeById);
exports.default = router;
//# sourceMappingURL=showtimeRoutes.js.map