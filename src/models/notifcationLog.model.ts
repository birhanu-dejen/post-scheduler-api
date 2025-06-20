import mongoose from "mongoose";

const notificationLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String, required: true },
    message: String,
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("NotificationLog", notificationLogSchema);
