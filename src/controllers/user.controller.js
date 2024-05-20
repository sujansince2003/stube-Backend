import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";

import { uploadtocloudinary } from "../utils/cloudinaryFileUpload.js";
import { apiResponse } from "../utils/apiResponse.js";

//creating function to register user

const registerUser = asyncHandler(async (req, res) => {
  //getting user details from frontend

  const { username, fullName, email, password } = req.body;
  // console.log(username);

  // validation code
  // .some() is a method that tests whether at least one element in the array passes the test implemented by the provided function. It returns a Boolean value: true if the callback function returns a truthy value for any array element; otherwise, false.
  if (
    [username, fullName, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All Fields are required");
  }

  // checks if user already exist with given username or email

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User already exist with these credentials");
  }

  //handling images
  const avatarlocalPath = req.files?.avatar[0]?.path;
  // const coverImagelocalPath = req.files?.coverImage[0]?.path;

  if (!avatarlocalPath) {
    throw new ApiError(400, "Avatar is required");
  }
  let coverImagelocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImagelocalPath = req.files?.coverImage[0]?.path;
  }

  // uploading files to cloudinary
  const avatar = await uploadtocloudinary(avatarlocalPath);
  const coverImage = await uploadtocloudinary(coverImagelocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is not uploaded to server");
  }

  // creating userobject and create entry to db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username ? username?.toLowerCase() : null,
  });

  // removing password and refreshToken  from response so that it cannot be accessed in frontend

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new apiResponse(200, createdUser, "User registered successfully"));
});

export { registerUser };
