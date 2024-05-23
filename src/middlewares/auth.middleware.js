import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", ""); // req.header("Authorization")?.replace("Bearer ", ""); this is for mobile application which doesnot store the cookie .in such app token is send as Bearer <token> so it comes as  Bearer <token>  so we only need token so we use string method to replace Bearer with empty string and get only token

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }
    //   we have included id,username,email... in the access token so extracting them now
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); //req token and secret key
    const user = await User.findById(decodedToken?._id).select(
      "-password,-refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    //   now when user is available we gonna add new object to req object
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
