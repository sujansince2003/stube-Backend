import mongoose from "mongoose";

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

//connecting to database
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8080, () => {
      console.log(`Server is running on port ${process.env.PORT} `);
    });
  })
  .catch((err) => {
    console.log("connection failed in promise", err);
  });
