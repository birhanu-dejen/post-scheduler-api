import { Router } from "express";
import {
  signup,
  signin,
  logout,
  forgotPassword,
  resetPassword,

  verifyEmail,

} from "../controllers/auth.controller";
//import { protect } from "../middlewares/auth.middleware";
const router = Router();
router.post("/signup", signup);
router.post("/signin", signin);

router.get("/verify-email", verifyEmail);
router.post("/logout", logout);
router.post("/forgotpassword", forgotPassword);
router.patch("/resetpassword", resetPassword);

export default router;
