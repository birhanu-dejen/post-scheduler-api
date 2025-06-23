import crypto from "crypto";
// Generates a password reset token, hashes it,
// saves the hash and expiry to the user, and returns the plain token.
import { IUser } from "../models/user.model";
export async function generateResetToken(user: IUser): Promise<string> {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes

  user.resetTokenHash = hashedToken;
  user.resetTokenExpires = expiresAt;
  await user.save({ validateBeforeSave: false }); // skip other validation

  return resetToken;
}
