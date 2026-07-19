"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mbooking";
async function cleanup() {
    await mongoose_1.default.connect(uri);
    const db = mongoose_1.default.connection.db;
    const indexes = await db.collection("users").indexes();
    console.log("Current indexes:", JSON.stringify(indexes, null, 2));
    for (const idx of indexes) {
        if (idx.name === "username_1") {
            await db.collection("users").dropIndex("username_1");
            console.log("Dropped username_1 index");
        }
    }
    await db.collection("users").deleteMany({});
    console.log("Cleared all users");
    await mongoose_1.default.disconnect();
}
cleanup();
//# sourceMappingURL=cleanup.js.map