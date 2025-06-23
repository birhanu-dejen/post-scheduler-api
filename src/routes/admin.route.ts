import { Router } from "express";
import {
  getAllScheduledPosts,
  getAllPublishedPosts,
} from "../controllers/admin.controller";

import { authorize, protect } from "../middlewares/auth.middleware";
const router = Router();
router.use(protect, authorize("admin"));
// Routes accessible only to authenticated admins
router.get("/scheduled", getAllScheduledPosts);
router.get("/published", getAllPublishedPosts);

export default router;
