import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  role: "user" | "admin";
}

const UserSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
