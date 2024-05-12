import mongoose from "mongoose";

import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./env",
});

connectDB();
