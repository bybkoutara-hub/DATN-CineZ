import mongoose, { Document, Schema } from "mongoose";

export interface IActor extends Document {
  name: string;
  bio: string;
  avatar: string;
  birthDate: Date;
  nationality: string;
}

const ActorSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    bio: { type: String, default: "" },
    avatar: { type: String, default: "" },
    birthDate: { type: Date },
    nationality: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<IActor>("Actor", ActorSchema);
