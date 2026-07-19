"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bookingController_1 = require("../controllers/bookingController");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect); // toàn bộ route booking cần đăng nhập
router.post("/", bookingController_1.createBooking);
router.get("/my-history", bookingController_1.getMyBookingHistory);
router.get("/mine", bookingController_1.getMyBookings);
router.post("/:id/cancel", bookingController_1.cancelBooking);
router.get("/:id", bookingController_1.getBookingById);
exports.default = router;
//# sourceMappingURL=bookingRoutes.js.map