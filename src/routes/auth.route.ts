import { Router } from "express";
import {
  signup,
  signin,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";
//import { protect } from "../middlewares/auth.middleware";
const router = Router();
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/logout", logout);
router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword/:token", resetPassword);
export default router;
