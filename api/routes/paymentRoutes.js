"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controllers/paymentController");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// Public routes - VNPay callbacks (không cần auth)
router.get("/vnpay/return", paymentController_1.vnpReturn);
router.get("/vnpay/ipn", paymentController_1.vnpIpn);
router.use(auth_middleware_1.protect);
// Protected routes - cần đăng nhập
router.post("/", paymentController_1.createPayment);
router.post("/vnpay/create-url", paymentController_1.createVnpayUrl);
router.get("/booking/:bookingId", paymentController_1.getPaymentByBooking);
exports.default = router;
//# sourceMappingURL=paymentRoutes.js.map