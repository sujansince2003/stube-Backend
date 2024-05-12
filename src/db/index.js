import mongoose from "mongoose";

import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}` //returns object
    );

    console.log(
      `MongoDB connected:: DB HOST:: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Error while connecting to database", error);
    process.exit(1); //reference to the currently running process in node js
  }
};
export default connectDB;
