// Xóa các vé "mồ côi" — vé trỏ tới suất chiếu đã bị xóa (do re-seed)
import mongoose from "mongoose";

const URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mbooking";
const Booking = mongoose.models.Booking || mongoose.model("Booking", new mongoose.Schema({}, { strict: false, collection: "bookings" }));
const Showtime = mongoose.models.Showtime || mongoose.model("Showtime", new mongoose.Schema({}, { strict: false, collection: "showtimes" }));

await mongoose.connect(URI);
const validIds = new Set((await Showtime.find({}, "_id").lean()).map((s) => String(s._id)));
const all = await Booking.find({}).lean();
const orphanIds = all.filter((b) => !validIds.has(String(b.showtimeId))).map((b) => b._id);
const res = await Booking.deleteMany({ _id: { $in: orphanIds } });
console.log(`Đã xóa ${res.deletedCount} vé mồ côi. Còn lại ${all.length - res.deletedCount} vé hợp lệ.`);
await mongoose.disconnect();
