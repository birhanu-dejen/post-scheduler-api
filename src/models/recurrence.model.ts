import mongoose, { HydratedDocument, InferSchemaType, Types } from "mongoose";

// Allowed recurrence frequencies
export type Frequency = "minute" | "daily" | "weekly" | "monthly";

// Interface for type-safety (extends just plain object, not Document)
export interface IRecurrenceRule {
  postId: mongoose.Types.ObjectId;
  frequency: Frequency;
  interval: number;
  nextRun: Date;
}

// Schema definition — must come before using in types!
const recurrenceRuleSchema = new mongoose.Schema(
  {
    // Reference to the post this rule is linked to
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    // Recurrence frequency (e.g., daily, weekly)
    frequency: {
      type: String,
      enum: ["minute", "daily", "weekly", "monthly"],
      required: true,
    },
    interval: { type: Number, default: 1, min: 1 },
    // Next time the recurring job should run
    nextRun: { type: Date, required: true },
  },
  { timestamps: true }
);

// Index to speed up "what should run next?" queries
recurrenceRuleSchema.index({ nextRun: 1 });

// Hydrated document type with correct _id typing
export type RecurrenceRuleDoc = HydratedDocument<
  InferSchemaType<typeof recurrenceRuleSchema>,
  {},
  { _id: Types.ObjectId }
>;

// Export the model with the typed document to fix _id: unknown problem
export default mongoose.model<RecurrenceRuleDoc>(
  "RecurrenceRule",
  recurrenceRuleSchema
);
