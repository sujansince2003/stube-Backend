import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";

import { uploadtocloudinary } from "../utils/cloudinaryFileUpload.js";
import { apiResponse } from "../utils/apiResponse.js";

//creating method to generaterefreshtokenandaccesstoken
const generateRefreshtokenandAccesstoken = async (userId) => {
  try {
    const user = User.findById(userId);
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    //adding refreshtoken to user db

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

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

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email) {
    throw new ApiError(400, "uesrname or email is required");
  }
  // finding the registered user (if)
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User is not registered");
  }

  //now if we get the user data object in user object we can access methods we defined in user model like generateRefreshToken,isPasswordCorrect etc we dont use User  !!!!

  //checking if password is correct

  const ispasswordValid = await user.isPasswordCorrect(password);
  if (!ispasswordValid) {
    throw new ApiError(401, "password is incorrect");
  }

  //refreshtoken and accesstoken by using method
  const { refreshToken, accessToken } =
    await generateRefreshtokenandAccesstoken(user._id);

  // send data of user excluding password and refreshToken
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // cookie procedure

  const options = {
    httpOnly: true,
    secure: true,
  };

  // returning response
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        { user: loggedInUser, refreshToken, accessToken },
        "Loggedin success"
      )
    );
});

//logging out user
const logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true, //doing this so that we can get new updated data
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User loggedout successfully"));
});
export { registerUser, loginUser, logoutUser };
