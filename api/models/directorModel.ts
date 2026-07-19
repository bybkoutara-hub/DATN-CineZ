import mongoose, { Document, Schema } from "mongoose";

export interface IDirector extends Document {
  name: string;
  bio: string;
  birthYear: number;
  nationality: string;
  image: string;
}

const DirectorSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    bio: { type: String, default: "" },
    birthYear: { type: Number },
    nationality: { type: String, default: "" },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<IDirector>("Director", DirectorSchema);
