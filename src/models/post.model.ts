import mongoose, {
  Schema,
  model,
  Types,
  InferSchemaType,
  HydratedDocument,
} from "mongoose";
// Allowed status values for a post
export type PostStatus = "scheduled" | "published" | "failed";
// Interface representing a Post document in MongoDB
export interface IPost extends Document {
  content: string;
  scheduledTime: Date;
  status: PostStatus;
  userId: mongoose.Types.ObjectId;
  // Optional: when the post was actually published
  publishedAt?: Date;
  recurring?: "none" | "daily" | "weekly";
}
// Schema definition for the Post model
const PostSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  scheduledTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ["scheduled", "published", "failed"],
    default: "scheduled",
  },
});
// Strongly typed version of the Post document
export type PostDoc = HydratedDocument<
  InferSchemaType<typeof PostSchema>,
  {},
  { _id: Types.ObjectId } // 👈 overrides the default `unknown`
>;

export default mongoose.model<IPost>("Post", PostSchema);
