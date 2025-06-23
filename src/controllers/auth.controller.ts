import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/user.model";
import { generateResetToken } from "../utils/tokens";
import { config } from "../config";
import {
  sendForgotPassword,
  sendSignUpVerification,
} from "../email/email.service";

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
    const verificationTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
    const hash = await bcrypt.hash(password, config.saltRounds);

    const verificationToken = jwt.sign({ email }, config.jwtVerifySecret, {
      expiresIn: "1h",
    });
    await User.create({
      email,
      password: hash,
      name,
      verificationToken: verificationToken,
      verificationTokenExpires,
    });

    const verificationLink = `${config.port}/verifyemail?token=${verificationToken}`;
    await sendSignUpVerification(email, name, verificationLink);
    res.status(201).json({ message: "Please check your email to verify" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unknown error occurred" });
  }
};

export const signin: RequestHandler = async (req, res) => {
  try {
    const { email, password } = (req.body ?? {}) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      res.status(400).json({ message: "Email and password required" });
      return;
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    if (!user.emailVerified) {
      res
        .status(401)
        .json({ message: "Please verify your account. Email sent." });
      return;
    }

    const ok = user.password && (await bcrypt.compare(password, user.password));
    if (!ok) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role }, // `user.id` is always a string
      config.jwtSignInSecret,
      { expiresIn: "2d" }
    );
    // Cookie config: httpOnly prevents JS access, sameSite avoids CSRF
    res
      .cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 2 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: "Logged in successfully",
        user: { id: user.id, email: user.email, name: user.name, token },
      });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
    return;
  }
};

export const logout: RequestHandler = async (req, res) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { email } = req.body as { email?: string };
    // Always return same response to avoid email enumeration
    const genericOk = () => {
      res.json({ message: "If the email exists, a reset link has been sent." });
    };

    if (!email) return genericOk();

    const user = await User.findOne({ email }).select(
      "+resetTokenHash +resetTokenExpires"
    );
    if (!user) return genericOk();

    const token = await generateResetToken(user);

    const resetUrl = `${config.port}/reset-password?token=${token}`;
    await sendForgotPassword(email, resetUrl);

    genericOk();
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
//todo i will fix the reset token mismatch error
export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.query.token as string | undefined;
    const { newPassword } = (req.body ?? {}) as { newPassword?: string };

    if (!token) {
      res.status(400).json({ message: "Token missing" });
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
      return;
    }

    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetTokenHash: hashed,
      resetTokenExpires: { $gt: new Date() },
    }).select("+resetTokenHash +resetTokenExpires");

    if (!user) {
      res.status(400).json({ message: "Token invalid or expired" });
      return;
    }

    user.password = await bcrypt.hash(newPassword, Number(config.saltRounds));
    user.resetTokenHash = user.resetTokenExpires = undefined;
    await user.save();

    res.json({ message: "Password updated" });
  } catch (err) {
    next(err);
  }
}

export const verifyEmail: RequestHandler = async (req, res) => {
  try {
    const verifyToken = req.query.token as string | undefined;

    if (!verifyToken) {
      res.status(400).json({ message: "Token missing." });
      return;
    }

    const user = await User.findOne({
      verificationToken: verifyToken,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ message: "Token is invalid or has expired." });
      return;
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully. You can now sign in." });
  } catch (err) {
    console.error("Email verification error:", err);
    res.status(500).json({ message: "Server error." });
  }
};
