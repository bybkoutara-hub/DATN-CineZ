import mongoose, { Document, Schema } from "mongoose";

export interface IActor extends Document {
  name: string;
  bio: string;
  birthYear: number;
  nationality: string;
  image: string;
}

const ActorSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    bio: { type: String, default: "" },
    birthYear: { type: Number },
    nationality: { type: String, default: "" },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<IActor>("Actor", ActorSchema);
