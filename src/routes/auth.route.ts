import { Router } from "express";
import {
  signup,
  signin,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from "../controllers/auth.controller";

const router = Router();
router.post("/signup", signup);
router.post("/signin", signin);
router.get("/verify-email", verifyEmail);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password", resetPassword);
export default router;
