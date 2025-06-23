import { Request, Response } from "express";
import Post from "../models/post.model";
import RecurrenceRule from "../models/recurrence.model";
import { schedulePublish } from "../jobs/publishJob";
import { scheduleRecurrence } from "../jobs/reccurJob";
import { agenda } from "../jobs/agenda";
import mongoose from "mongoose";
// Check if the current user is an admin or the owner of the post
const isOwnerOrAdmin = (user: Request["user"], post: any) =>
  user?.role === "admin" || post.userId.toString() === user?.userId;

export async function createPost(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { content, scheduledTime, recurrence } = req.body;
    if (!content || !scheduledTime) {
      res.status(400).json({ message: "content & scheduledTime required" });
      return;
    }

    const when = new Date(scheduledTime);
    if (isNaN(when.getTime()) || when <= new Date()) {
      res.status(400).json({ message: "scheduledTime must be in the future" });
      return;
    }

    const post = await Post.create({
      userId: req.user.userId,
      content,
      scheduledTime: when,
      status: "scheduled",
    });

    await schedulePublish(when, post._id.toString());

    if (recurrence?.frequency) {
      const rule = await RecurrenceRule.create({
        postId: post._id,
        frequency: recurrence.frequency,
        interval: recurrence.interval ?? 1,
        nextRun: when,
      });
      await scheduleRecurrence(when, rule._id.toString());
    }

    res.status(201).json({ post });
  } catch (err) {
    console.error("Createpost:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getPublishedPosts(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const posts = await Post.find({ status: "published" }).sort({
      publishedAt: -1,
    });
    res.json({ posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getPostStatus(
  req: Request,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    //validate ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid post ID" });
      return;
    }

    const post = await Post.findById(id).lean();
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    if (!isOwnerOrAdmin(req.user, post)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    res.status(200).json({ status: post.status });
  } catch (err) {
    console.error("getPostStatus:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function updatePost(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const { content, scheduledTime, recurrence } = req.body;
    //Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid post ID" });
      return;
    }
    const post = await Post.findById(id);
    if (!post || !isOwnerOrAdmin(req.user, post)) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    if (post.status !== "scheduled") {
      res.status(400).json({ message: "Cannot update after publish/failed" });
      return;
    }
    //  Only update what has changed
    if (content) post.content = content;
    if (scheduledTime) {
      const when = new Date(scheduledTime);
      if (isNaN(when.getTime()) || when <= new Date()) {
        res
          .status(400)
          .json({ message: "scheduledTime must be in the future" });
        return;
      }
      post.scheduledTime = when;
    }
    await post.save();

    await agenda.cancel({ "data.postId": id }); // Ensure old job is removed
    await schedulePublish(post.scheduledTime, id); //Always reschedule

    const rule = await RecurrenceRule.findOne({ postId: id });
    if (recurrence?.frequency) {
      if (rule) {
        rule.frequency = recurrence.frequency;
        rule.interval = recurrence.interval ?? 1;
        rule.nextRun = post.scheduledTime;
        await rule.save();
      } else {
        const newRule = await RecurrenceRule.create({
          postId: id,
          frequency: recurrence.frequency,
          interval: recurrence.interval ?? 1,
          nextRun: post.scheduledTime,
        });
        await scheduleRecurrence(post.scheduledTime, newRule._id.toString());
      }
    } else if (rule) {
      //  Clean up recurrence rule if it no longer exists
      await agenda.cancel({ "data.ruleId": rule._id.toString() });
      await rule.deleteOne();
    }

    res.json({ post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function deletePost(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post || !isOwnerOrAdmin(req.user, post)) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    if (post.status !== "scheduled") {
      res.status(400).json({ message: "Cannot delete after publish/failed" });
      return;
    }

    await agenda.cancel({ "data.postId": id });
    await RecurrenceRule.deleteMany({ postId: id });
    //  Don’t cancel all rules globally – filter by post
    await agenda.cancel({ "data.ruleId": { $exists: true } });

    await post.deleteOne();
    res.status(204).send({ message: "post deleted successfully" }); // use a body for client feedback
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
