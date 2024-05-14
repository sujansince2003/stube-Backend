import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { asyncHandle } from "./utils/index.js";

const app = express();

//configuring CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);

app.use(express.json({ limit: "16kb" })); //express is accepting json data with size upto 16kb

// encoding URL
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

//using cookie parser package to store and access cookies of client browser from server

app.use(cookieParser());

export { app };
