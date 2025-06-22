// src/routes/adminPost.route.ts
import { Router } from "express";
import {
  getAllScheduledPosts,
  getAllPublishedPosts,
} from "../controllers/admin.controller";
//import { authMiddleware } from "../middlewares/auth.middleware";
//import { adminMiddleware } from "../middlewares/admin.middleware";

const router = Router();

// Protect all routes: user must be authenticated AND admin
//router.use(authMiddleware, adminMiddleware);

router.get("/scheduled", getAllScheduledPosts);
router.get("/published", getAllPublishedPosts);

export default router;
