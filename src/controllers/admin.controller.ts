import { Request, Response, NextFunction } from "express";
import Post from "../models/post.model";

// Admin view scheduled posts
export const getAllScheduledPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const posts = await Post.find({ status: "scheduled" }).populate(
      "userId",
      "email"
    );
    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};

// Admin view published posts
export const getAllPublishedPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const posts = await Post.find({ status: "published" }).populate(
      "userId",
      "email"
    );
    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};
