import mongoose, { Document, Schema } from "mongoose";

export interface IAdminBooking extends Document {
  user_id: mongoose.Types.ObjectId;
  showtime_id: mongoose.Types.ObjectId;
  seats: string[];
  combo: mongoose.Types.ObjectId;
  comboQuantity: number;
  totalAmount: number;
  paymentStatus: "pending" | "completed" | "cancelled";
  createdAt: Date;
}

const AdminBookingSchema: Schema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "AdminUser", required: true },
    showtime_id: { type: Schema.Types.ObjectId, ref: "AdminShowtime", required: true },
    seats: { type: [String], default: [] },
    combo: { type: Schema.Types.ObjectId, ref: "AdminCombo" },
    comboQuantity: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["pending", "completed", "cancelled"], default: "completed" },
  },
  { timestamps: true, collection: "bookings" }
);

export default mongoose.model<IAdminBooking>("AdminBooking", AdminBookingSchema);
