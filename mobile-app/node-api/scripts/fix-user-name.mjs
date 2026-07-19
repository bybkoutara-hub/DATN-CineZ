// Sửa lại tên user bị lỗi mã hóa UTF-8 (do tạo bằng curl trên Windows trước đó)
import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mbooking";

const userSchema = new mongoose.Schema({}, { strict: false, collection: "users" });
const User = mongoose.models.User || mongoose.model("User", userSchema);

async function run() {
  await mongoose.connect(MONGODB_URI);
  const res = await User.updateOne(
    { email: "hung@demo.com" },
    { $set: { name: "Võ Văn Hùng", phone: "0905123456" } },
  );
  console.log("Đã cập nhật tên:", JSON.stringify(res));
  const u = await User.findOne({ email: "hung@demo.com" }).lean();
  console.log("Tên hiện tại trong DB:", u?.name);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
