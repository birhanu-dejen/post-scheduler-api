import mongoose from "mongoose";

const recurrenceRuleSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: true,
    },
    interval: { type: Number, default: 1 }, // every 1 day/week/etc
    nextRun: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("RecurrenceRule", recurrenceRuleSchema);
