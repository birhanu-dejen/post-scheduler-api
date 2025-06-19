import mongoose, { Schema, Document } from "mongoose";

export type PostStatus = "scheduled" | "published" | "failed";

export interface IPost extends Document {
  content: string;
  scheduledTime: Date;
  status: PostStatus;
  user: mongoose.Types.ObjectId;
  publishedAt?: Date;
  recurring?: "none" | "daily" | "weekly";
}

const PostSchema: Schema = new Schema({
  content: { type: String, required: true },
  scheduledTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ["scheduled", "published", "failed"],
    default: "scheduled",
  },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  publishedAt: { type: Date },
  recurring: {
    type: String,
    enum: ["none", "daily", "weekly"],
    default: "none",
  },
});

export default mongoose.model<IPost>("Post", PostSchema);
