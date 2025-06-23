import mongoose, { Document } from "mongoose";

// Interface for type-safety
export interface INotificationLog extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  message?: string;
  sentAt: Date;
}

const notificationLogSchema = new mongoose.Schema(
  {
    // Reference to the user receiving the notification
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Added required for relational integrity
    // Type of notification, e.g., 'EMAIL', 'SMS', 'PUSH'
    type: { type: String, required: true },
    // The message content sent to the user
    message: String,
    // Timestamp when the notification was sent
    sentAt: { type: Date, default: Date.now }, // Keep as is to record send time
  },
  { timestamps: true }
);

export default mongoose.model<INotificationLog>(
  "NotificationLog",
  notificationLogSchema
);
