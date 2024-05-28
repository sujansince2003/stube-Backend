import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { uploadtocloudinary } from "../utils/cloudinaryFileUpload.js";
import { apiResponse } from "../utils/apiResponse.js";

// creating method to generaterefreshtokenandaccesstoken
const generateRefreshtokenandAccesstoken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
      return;
    }

    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    //adding refreshtoken to user db

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      error.message ||
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

  if (!(username || email)) {
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
      $unset: {
        refreshToken: 1,
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

//once the access token is expire we can again refresh that token with the refresh token we saved in db so now creating a endpoint for that

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request *Token  unavailable");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Token expired");
    }

    const { newrefreshToken, accessToken } =
      await generateRefreshtokenandAccesstoken(user._id);
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("refreshToken", newrefreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json(
        new apiResponse(
          200,
          { accessToken, refreshToken: newrefreshToken },
          "new access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token");
  }
});

// changing the data
// changing the password
const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);
  const { oldPassword, newPassword } = req.body;
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "invalid password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Password changed successfully"));
});

// getting current user

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new apiResponse(200, req.user, "User data fetched successfully "));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "fullname and email is required");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    { new: true } //when set to true we get updated data back
  ).select("-password");

  return res
    .status(200)
    .json(new apiResponse(200, user, "account details updated"));
});

//updating files

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalfilePath = req.file?.path;

  if (!avatarLocalfilePath) {
    throw new ApiError(400, "Invalid avatar file or file is missing");
  }
  const avatar = await uploadtocloudinary(avatarLocalfilePath);
  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading to cloudinary");
  }
  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res
    .status(200)
    .json(new apiResponse(200, user, "Avatar Image updated Successfully"));
});
const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalfilePath = req.file?.path;

  if (!coverImageLocalfilePath) {
    throw new ApiError(400, "Invalid avatar file or file is missing");
  }
  const coverImage = await uploadtocloudinary(coverImageLocalfilePath);
  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading to cloudinary");
  }
  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res
    .status(200)
    .json(new apiResponse(200, user, "Cover Image updated Successfully"));
});

// writing mongodb aggregation pipelines

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "username is missing while fetching user data");
  }
  // now if we the username we can use User.find(username)  but we have better approach
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(), //match the username in database with the username we got from req.params
      },
    },
    {
      $lookup: {
        from: "subscriptions", //documents from which we wanna refer from  vakar User ma xu subscriptiosn wala ma join gar
        localField: "_id", //The field from the documents in the User collection that the $lookup uses to perform the join.    User bata k match hanney
        foreignField: "channel", //he field from the documents in the "subscriptions" collection that the $lookup matches against the localField       subscriptions collection ma gayera  local field lai k ma connect hanney
        as: "subscribers", //The name of the new array field to add to the input documents. The output documents will include an additional field named "subscribers", which contains an array of matching documents from the "subscriptions" collection. If no matches are found, this field will be an empty array.
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers", //using $ because subscribers is now a  we got from first lookup operation
        },
        channelsSubscribedTo: {
          $size: "$channel",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] }, //subscribers field vitra gayera subscriber vitra req.user?._id match xa ki nai check
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        email: 1,
        subscribersCount: 1,
        channelsSubscribedTo: 1,
        isSubscribed: 1,
        avatar: true,
        coverImage: true,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "channel doesnot exists");
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, channel[0], "Channel data fetched successfully")
    );
});

// writing sub pipelines for watchHistory

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        // _id:req.user._id //we cannot use this because mongoose wont work while writing the aggregation pipelines, they are direct implement in DB so we user new mongoose.Types.ObjectId()

        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videodatas",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        //now we got watch history in User model but also we need user in video model to so we gonna write sub pipelines for again adding user to videomodel collection [see video model]
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        user[0].watchHistory,
        "watch history fetched successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
