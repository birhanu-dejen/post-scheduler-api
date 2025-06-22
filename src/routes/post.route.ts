import { Router } from "express";
import {
  createPost,
  getPublishedPosts,
  getPostStatus,
  updatePost,
  deletePost,
} from "../controllers/post.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// protect every route
//router.use(authMiddleware);

router.post("/create", protect, createPost);
router.get("/published", getPublishedPosts);
router.get("/:id/status", protect, getPostStatus);
router.patch("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

export default router;
