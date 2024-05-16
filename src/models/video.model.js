// Import necessary modules
import mongoose, { Schema } from "mongoose"; // Import Mongoose for MongoDB object modeling
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; // Import plugin for pagination support

// Define the Video schema
const videoSchema = new Schema(
  {
    // Fields for the Video schema
    videoFile: {
      type: String, // Path or URL to the video file
      required: true, // Must be provided
    },
    thumbnail: {
      type: String, // Path or URL to the thumbnail image
      required: true, // Must be provided
    },
    title: {
      type: String, // Title of the video
      required: true, // Must be provided
    },
    description: {
      type: String, // Description of the video
      required: true, // Must be provided
    },
    duration: {
      type: Number, // Duration of the video in seconds
      required: true, // Must be provided
    },
    views: {
      type: Number, // Number of views the video has received
      required: true, // Must be provided
      default: 0, // Default value if not provided
    },
    isPublished: {
      type: Boolean, // Indicates whether the video is published
      required: true, // Must be provided
      default: true, // Default to true if not provided
    },
    owner: {
      type: Schema.Types.ObjectId, // Reference to the User document that owns this video
      ref: "User", // Name of the referenced collection
    },
  },

  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Apply the mongooseAggregatePaginate plugin to enable aggregation-based pagination
videoSchema.plugin(mongooseAggregatePaginate);

// Compile the VideoData model from the schema
export const VideoData = mongoose.model("VideoData", videoSchema);
