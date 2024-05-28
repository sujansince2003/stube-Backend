import mongoose, { Schema } from "mongoose";

const likesSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "VideoData",
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
    },
    linkedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const likes = mongoose.model("likes", likesSchema);
