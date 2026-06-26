import mongoose, { Document, Schema } from "mongoose";

export interface IGenre extends Document {
  name: string;
  description: string;
}

const GenreSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<IGenre>("Genre", GenreSchema);
