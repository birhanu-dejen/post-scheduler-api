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
router.get("/published", getPublishedPosts); // public, no protect

router.use(protect); // protect everything below
router.post("/create", createPost);
router.get("/:id/status", getPostStatus);
router.patch("/:id", updatePost);
router.delete("/:id", deletePost);

export default router;
