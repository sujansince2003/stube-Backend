import mongoose, { Schema } from "mongoose";

/**
 everytime a user subscribe to a channel(user), a new doc is created everytime
for getting subs of a user= count channel which is equal to that user
fot getting to whom the user subscribed: count subscribers in each doc

doc sample contain a channel and subscriber so
to get subscribers count channel and to get channel to whom subscribed count subscriber



 */

const subscriptionSchema = new Schema(
  {
    subscriber: {
      //one who is subscribing
      type: Schema.types.ObjectId,
      ref: "User",
    },

    channel: {
      // one to whom "subscriber " is subscribing
      type: Schema.types.ObjectId,
      ref: "User",
    },
  },

  { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
