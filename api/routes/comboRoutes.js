"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const comboController_1 = require("../controllers/comboController");
const router = express_1.default.Router();
router.get("/", comboController_1.getCombos);
router.post("/", comboController_1.addCombo);
exports.default = router;
//# sourceMappingURL=comboRoutes.js.map