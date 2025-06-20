import { RequestHandler } from "express";
import { Types } from "mongoose";
import Post from "../models/post.model";

/* ---------- CREATE POST ---------- */
export const createPost: RequestHandler = async (req, res, next) => {
  try {
    const { content, scheduledTime } = req.body;
    const userId = req.user?.id;

    if (!content || !userId) {
      res.status(400).json({ message: "Content and authentication required" });
      return;
    }

    const post = await Post.create({
      content,
      scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
      user: userId,
      status: scheduledTime ? "scheduled" : "draft",
    });

    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

/* ---------- GET ALL USER POSTS ---------- */
export const getPosts: RequestHandler = async (req, res, next) => {
  try {
    const posts = await Post.find({ user: req.user?.id }).sort({
      createdAt: -1,
    });
    res.json(posts);
  } catch (err) {
    next(err);
  }
};

/* ---------- UPDATE POST ---------- */
export const updatePost: RequestHandler = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const { content, scheduledTime } = req.body;

    if (!Types.ObjectId.isValid(postId)) {
      res.status(400).json({ message: "Invalid post ID" });
      return;
    }

    const post = await Post.findOneAndUpdate(
      { _id: postId, user: req.user?.id },
      {
        content,
        scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
      },
      { new: true }
    );

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.json(post);
  } catch (err) {
    next(err);
  }
};

/* ---------- DELETE POST ---------- */
export const deletePost: RequestHandler = async (req, res, next) => {
  try {
    const postId = req.params.id;

    if (!Types.ObjectId.isValid(postId)) {
      res.status(400).json({ message: "Invalid post ID" });
      return;
    }

    const deleted = await Post.findOneAndDelete({
      _id: postId,
      user: req.user?.id,
    });

    if (!deleted) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    next(err);
  }
};
