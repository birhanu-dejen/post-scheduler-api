import mongoose, { Schema, Document } from "mongoose";
// Interface for User model type-safety
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  emailVerified: boolean;
  //verification token fields
  verificationToken?: string; // NEW
  verificationTokenExpires?: Date;
  // Password reset fields
  resetTokenHash?: string;
  resetTokenExpires?: Date;
}
// Schema definition for User
const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    //  password reset token (hidden from query by default)
    resetTokenHash: { type: String, select: false },
    resetTokenExpires: { type: Date, select: false },
    // Email verification flag
    emailVerified: { type: Boolean, default: false },
    // verification token fields
    verificationToken: String,
    verificationTokenExpires: Date,
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
