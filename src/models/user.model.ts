import mongoose, { Schema, Document } from "mongoose";

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

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // Embedded password reset token info
    resetTokenHash: { type: String, select: false },
    resetTokenExpires: { type: Date, select: false },
    //verification token fields
    emailVerified: { type: Boolean, default: false },
    verificationToken: String, // NEW
    verificationTokenExpires: Date,
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
