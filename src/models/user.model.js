// Import necessary modules
import mongoose, { Schema } from "mongoose"; // Mongoose for MongoDB object modeling
import jwt from "jsonwebtoken"; // jsonwebtoken for creating JSON Web Tokens
import bcrypt from "bcrypt"; // bcrypt for hashing passwords

// Define the User schema
const userSchema = new Schema(
  {
    // Fields for the User schema
    username: {
      type: String,
      required: true, // Must be present
      unique: true, // Each username must be unique
      lowercase: true, // Convert to lowercase
      trim: true, // Remove whitespace from both ends
      index: true, // Index for faster search
    },
    email: {
      type: String,
      required: true, // Must be present
      unique: true, // Each email must be unique
      lowercase: true, // Convert to lowercase
      trim: true, // Remove whitespace from both ends
    },
    fullName: {
      type: String,
      required: true, // Must be present
      lowercase: true, // Convert to lowercase
      trim: true, // Remove whitespace from both ends
    },
    avatar: {
      type: String, // URL to the user's avatar image
      required: true, // Must be present
    },
    coverImage: {
      type: String, // URL to the user's cover image
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId, // Reference to Video documents
        ref: "Video", // Link to the Video model
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"], // Must be present
    },
    refreshToken: {
      type: String,
      required: true, // Must be present
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Pre-save hook to hash the user's password before saving
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified
  if (!this.isModified("password")) return next();

  // Hash the password using bcrypt
  this.password = await bcrypt.hashSync(this.password, 10);

  // Proceed to the next middleware
  next();
});

// Method to verify if the provided password matches the stored hashed password
userSchema.methods.isPasswordCorrect = async function (providedpassword) {
  // Compare the provided password with the stored hashed password
  return await bcrypt.compare(providedpassword, this.password);
};

// Method to generate an access token for the user
userSchema.methods.generateAccessToken = function () {
  // Create a JWT access token
  return jwt.sign(
    {
      _id: this._id, // Include user ID in the token
      email: this.email, // Include email in the token
      username: this.username, // Include username in the token
      fullName: this.fullName, // Include full name in the token
    },
    process.env.ACCESS_TOKEN_SECRET, // Secret key for signing the token
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY } // Token expiration time
  );
};

// Method to generate a refresh token for the user
userSchema.methods.generateRefreshToken = function () {
  // Create a JWT refresh token
  return jwt.sign(
    {
      _id: this._id, // Include user ID in the token
      email: this.email, // Include email in the token
      username: this.username, // Include username in the token
      fullName: this.fullName, // Include full name in the token
    },
    process.env.REFRESH_TOKEN_SECRET, // Secret key for signing the token
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY } // Token expiration time
  );
};

// Compile the User model from the schema
export const User = mongoose.model("User", userSchema);
