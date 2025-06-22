import crypto from "crypto";

export async function generateResetToken(user: any): Promise<string> {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.resetTokenHash = hashedToken;
  user.resetTokenExpires = expiresAt;
  await user.save({ validateBeforeSave: false }); // skip other validation

  return resetToken;
}
