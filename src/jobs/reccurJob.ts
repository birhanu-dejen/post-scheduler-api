import { agenda } from "./agenda";
import Post from "../models/post.model";
import RecurrenceRule from "../models/recurrence.model";
import { schedulePublish } from "./publishJob";
import { addDays, addWeeks, addMonths, addMinutes } from "date-fns";

const JOB_NAME = "post.recur";

agenda.define(JOB_NAME, async (job: any) => {
  const { ruleId } = job.attrs.data as { ruleId: string };

  const rule = await RecurrenceRule.findById(ruleId);
  if (!rule) return;

  const template = await Post.findById(rule.postId);
  if (!template) return;

  // Clone post for this run
  const nextPost = await Post.create({
    userId: template.userId,
    content: template.content,
    scheduledTime: rule.nextRun,
    status: "scheduled",
  });

  await schedulePublish(rule.nextRun, nextPost._id.toString());

  // Calculate following run
  const interval = rule.interval ?? 1;
  let next: Date;
  switch (rule.frequency) {
    case "minute":
      next = addMinutes(rule.nextRun, interval);
      break;
    case "daily":
      next = addDays(rule.nextRun, interval);
      break;
    case "weekly":
      next = addWeeks(rule.nextRun, interval);
      break;
    case "monthly":
      next = addMonths(rule.nextRun, interval);
      break;
    default:
      return;
  }

  rule.nextRun = next;
  await rule.save();

  await agenda.schedule(next, JOB_NAME, { ruleId });
});

export function scheduleRecurrence(date: Date, ruleId: string) {
  return agenda.schedule(date, JOB_NAME, { ruleId });
}
