import mongoose, { Document, Schema } from "mongoose";

export interface IShowtime extends Document {
  movie: mongoose.Types.ObjectId;   // FK -> Movie
  room?: mongoose.Types.ObjectId;   // FK -> Room
  roomName: string;                 // snapshot tên phòng (hiển thị nhanh, không cần populate)
  startTime: Date;
  price: number;                    // giá 1 ghế chuẩn
  availableSeats: string[];         // CỐT LÕI chống trùng ghế: danh sách ghế còn trống
  layout?: any;                     // snapshot sơ đồ ghế của phòng tại thời điểm tạo suất
  status: "active" | "cancelled";
}

const ShowtimeSchema: Schema = new Schema(
  {
    movie: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
    room: { type: Schema.Types.ObjectId, ref: "Room", default: null },
    roomName: { type: String, required: true },
    startTime: { type: Date, required: true },
    price: { type: Number, required: true },
    availableSeats: { type: [String], required: true },
    layout: { type: Schema.Types.Mixed, default: null },
    status: { type: String, enum: ["active", "cancelled"], default: "active" },
  },
  { timestamps: true }
);

// Truy vấn nhanh: lịch chiếu theo phim / theo ngày
ShowtimeSchema.index({ movie: 1, startTime: 1 });
ShowtimeSchema.index({ startTime: 1 });

export default mongoose.model<IShowtime>("Showtime", ShowtimeSchema);