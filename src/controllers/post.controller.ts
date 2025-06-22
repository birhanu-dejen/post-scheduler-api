
import User from "../models/user.model";
import { Request, Response } from "express";
import Post from "../models/post.model";
import RecurrenceRule from "../models/recurrence.model";
import { schedulePublish } from "../jobs/publishJob";
import { scheduleRecurrence } from "../jobs/reccurJob";
import { agenda } from "../jobs/agenda";
import { sendPostPublishedNotification } from "../email/email.service";
const isOwnerOrAdmin = (user: Request["user"], post: any) =>
  user?.role === "admin" || post.userId.toString() === user?.id;

/* ----------------------------- 1. Create post ----------------------------- */
export async function createPost(req: Request, res: Response): Promise<void> {
  try {
    /* ---------- 1. Auth ---------- */
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    /* ---------- 2. Validate body ---------- */
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

    /* ---------- 3. Create post ---------- */
    const post = await Post.create({
      userId: req.user.id,
      content,
      scheduledTime: when,
      status: "scheduled",
    });

    /* ---------- 4. Schedule first publish ---------- */
    await schedulePublish(when, post._id.toString());

    /* ---------- 5. Handle optional recurrence ---------- */
    if (recurrence?.frequency) {
      const rule = await RecurrenceRule.create({
        postId: post._id,
        frequency: recurrence.frequency,
        interval: recurrence.interval ?? 1,
        nextRun: when,
      });
      await scheduleRecurrence(when, rule._id.toString());
    }

    /* ---------- 6. Respond ---------- */
    res.status(201).json({ post });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/* ------------------------ 2. Get published posts -------------------------- */
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

/* -------------------------- 3. Get post status ---------------------------- */
export async function getPostStatus(
  req: Request,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const post = await Post.findById(req.params.id);
    if (!post || !isOwnerOrAdmin(req.user, post)) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.json({ status: post.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

/* ------------------------ 4. Update scheduled post ------------------------ */
export async function updatePost(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const { content, scheduledTime, recurrence } = req.body;

    const post = await Post.findById(id);
    if (!post || !isOwnerOrAdmin(req.user, post)) {

      res.status(404).json({ message: "Post not found" });
      return;
    }


    if (post.status !== "scheduled") {
      res.status(400).json({ message: "Cannot update after publish/failed" });
      return;
    }

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

    await agenda.cancel({ "data.postId": id });
    await schedulePublish(post.scheduledTime, id);

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
      await agenda.cancel({ "data.ruleId": rule._id.toString() });
      await rule.deleteOne();
    }

    res.json({ post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

/* -------------------- 5. Delete scheduled (unpublished) ------------------- */
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
    await agenda.cancel({ "data.ruleId": { $exists: true } });

    await post.deleteOne();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

