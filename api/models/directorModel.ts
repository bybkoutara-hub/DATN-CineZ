import mongoose, { Document, Schema } from "mongoose";

export interface IDirector extends Document {
  name: string;
  bio: string;
  avatar: string;
  birthDate: Date;
  nationality: string;
}

const DirectorSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    bio: { type: String, default: "" },
    avatar: { type: String, default: "" },
    birthDate: { type: Date },
    nationality: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<IDirector>("Director", DirectorSchema);
