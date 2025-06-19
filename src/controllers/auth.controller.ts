import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/user.model";
import { generateToken } from "../utils/generateToken";
import { config } from "../config";

import PasswordresetToken from "../models/resetToken.model";

/* ---------- SIGN‑UP ---------- */
export const signup: RequestHandler = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ message: "All fields required" });
      return;
    }

    if (await User.findOne({ email })) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    const hash = await bcrypt.hash(password, config.saltRounds);
    const user = await User.create({ email, password: hash, name });

    const token = generateToken(user.id);
    res.status(201).json({ token, user: { id: user.id, email, name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------- SIGN‑IN ---------- */
export const signin: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = generateToken(user.id);
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------- LOGOUT (stateless) ---------- */
export const logout: RequestHandler = (_req, res) => {
  try {
    res.status(200).json({ message: "Logged out" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------- FORGOT‑PASSWORD ---------- */
export const forgotPassword: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.json({ message: "If the email exists, a reset link has been sent." });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes from now

    // Remove any existing tokens for this user (optional but recommended)
    await PasswordresetToken.deleteMany({ userId: user._id });

    // Create and save new reset token
    await PasswordresetToken.create({
      userId: user._id,
      tokenHash: hashedToken,
      expiresAt,
    });
    // TODO: send email with `resetToken`
    res.json({ message: "Reset link sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------- RESET‑PASSWORD ---------- */
export const resetPassword: RequestHandler = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find the reset token document (not user)
    const resetTokenDoc = await PasswordresetToken.findOne({
      tokenHash: hashedToken,
      expiresAt: { $gt: new Date() },
    });

    if (!resetTokenDoc) {
      res.status(400).json({ message: "Token invalid or expired" });
      return;
    }

    // Find the user by userId from reset token document
    const user = await User.findById(resetTokenDoc.userId);
    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }
    // Update user password
    user.password = await bcrypt.hash(newPassword, config.saltRounds);
    await user.save();

    // Delete the used reset token
    await resetTokenDoc.deleteOne();

    res.json({ message: "Password updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
