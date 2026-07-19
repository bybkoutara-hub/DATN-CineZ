"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const promotionController_1 = require("../controllers/promotionController");
const router = express_1.default.Router();
router.get("/", promotionController_1.getPromotions);
router.post("/apply", promotionController_1.applyPromo);
exports.default = router;
//# sourceMappingURL=promotionRoutes.js.map