import { agenda } from "./agenda";
import Post from "../models/post.model";
import NotificationLog from "../models/notifcationLog.model";
import User from "../models/user.model";
import { sendPostPublishedNotification } from "../email/email.service";

const JOB_NAME = "post.publish";

agenda.define(JOB_NAME, async (job: any) => {
  const { postId } = job.attrs.data as { postId: string };
  const post = await Post.findById(postId);
  if (!post) return;

  try {
    post.status = "published";
    post.publishedAt = new Date();
    await post.save();

    // Notify the user by email if email exists
    const user = await User.findById(post.userId);
    if (user?.email) {
      const postUrl = `https://your-site.com/posts/${post._id}`;
      const title = post.content.slice(0, 30);
      await sendPostPublishedNotification(user.email, title, postUrl);
    }

    // Log successful publication
    await NotificationLog.create({
      userId: post.userId,
      type: "post_published",
      message: `Post ${post._id} published.`,
    });
  } catch (err) {
    // On error, mark post as failed and log failure
    post.status = "failed";
    await post.save();

    await NotificationLog.create({
      userId: post.userId,
      type: "publish_failed",
      message: `Post ${post._id} failed to publish.`,
    });

    console.error("Publish job failed:", err);
  }
});

export function schedulePublish(date: Date, postId: string) {
  return agenda.schedule(date, JOB_NAME, { postId });
}
