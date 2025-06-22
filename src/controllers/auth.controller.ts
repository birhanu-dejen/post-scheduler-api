import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/user.model";
import { generateResetToken } from "../utils/tokens";
import { config } from "../config";
import {
  sendForgotPassword,
  sendSignUpVerification,
} from "../email/email.service";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
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

    const verificationLink = `http://localhost:5000/verify-email?token=${verificationToken}`;
    await sendSignUpVerification(email, name, verificationLink);
    res.status(201).json({ message: "please check your email to verify" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unknown error occurred" });
  }
};

/* ---------- SIGN‑IN ---------- */
export const signin: RequestHandler = async (req, res) => {
  try {
    /* 1️⃣  Field check -------------------------------------------------- */
    const { email, password } = (req.body ?? {}) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      res.status(400).json({ message: "Email and password required" });
      return; // <- void ✔
    }

    /* 2️⃣  Find user & verify ------------------------------------------ */
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

    /* 3️⃣  Issue JWT --------------------------------------------------- */
    const token = jwt.sign(
      { userId: user.id, role: user.role }, // `user.id` is always a string
      config.jwtSignInSecret,
      { expiresIn: "2d" }
    );

    /* 4️⃣  Send cookie + JSON (void) ----------------------------------- */
    res
      .cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 1000, // 1 h
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
/* ---------- LOGOUT (stateless) ---------- */

export const logout: RequestHandler = async (req, res) => {
  try {
    /* 2️⃣  Clear the HTTP-only cookie that holds the access token */
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/", // must match the path used when setting
    });

    /* 3️⃣  Respond with a success message (200 OK) */
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------- FORGOT‑PASSWORD ---------- */
export const forgotPassword: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { email } = req.body as { email?: string };

    // Always return generic response to prevent email enumeration
    const genericOk = () => {
      res.json({ message: "If the email exists, a reset link has been sent." });
    };

    if (!email) return genericOk();

    const user = await User.findOne({ email }).select(
      "+resetTokenHash +resetTokenExpires"
    );
    if (!user) return genericOk();

    const token = await generateResetToken(user);

    const resetUrl = `https://your-site.com/resetpassword?token=${token}`;
    await sendForgotPassword(email, resetUrl);

    genericOk(); // ✅ no return
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
/* ---------- RESET‑PASSWORD ---------- */

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.query.token as string | undefined;
    const { newPassword } = (req.body ?? {}) as { newPassword?: string };

    // -------- validate input ----------
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

    // -------- find user via hashed token ----------
    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetTokenHash: hashed,
      resetTokenExpires: { $gt: new Date() },
    }).select("+resetTokenHash +resetTokenExpires");

    if (!user) {
      res.status(400).json({ message: "Token invalid or expired" });
      return;
    }

    // -------- update password & clear reset fields ----------
    user.password = await bcrypt.hash(newPassword, Number(config.saltRounds));
    user.resetTokenHash = user.resetTokenExpires = undefined;
    await user.save();

    res.json({ message: "Password updated" });
  } catch (err) {
    next(err); // let central error handler log/format
  }
}

/* ---------- VERIFY‑EMAIL ---------- */

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

    // Mark verified and clear token fields
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
