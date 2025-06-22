import mongoose, {
  Schema,
  model,
  Types,
  InferSchemaType,
  HydratedDocument,
} from "mongoose";
export type PostStatus = "scheduled" | "published" | "failed";

export interface IPost extends Document {
  content: string;
  scheduledTime: Date;
  status: PostStatus;
  userId: mongoose.Types.ObjectId;
  publishedAt?: Date;
  recurring?: "none" | "daily" | "weekly";
}

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

export type PostDoc = HydratedDocument<
  InferSchemaType<typeof PostSchema>,
  {},
  { _id: Types.ObjectId } // 👈 overrides the default `unknown`
>;

export default mongoose.model<IPost>("Post", PostSchema);
