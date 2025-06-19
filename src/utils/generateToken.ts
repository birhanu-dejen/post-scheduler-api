import jwt, { SignOptions } from "jsonwebtoken";
import type { StringValue } from "ms"; // purely for typing

export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || "dev_secret";

  // Cast env var (or fallback) to the narrow type the lib expects
  const expiresIn: StringValue | number =
    (process.env.JWT_EXPIRES_IN as StringValue | undefined) ?? "1h";

  const options: SignOptions = { expiresIn };

  return jwt.sign({ id: userId }, secret, options);
};
