import { Router } from "express";
import {
  changePassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

/*just before calling  registerUser we call multer upload middleware
 How It Works:
 1.Client-Side Request: A client sends a POST request to /register with multipart/form-data containing two parts: avatar and coverImage.
 2.Multer Processing:
 -Multer intercepts the incoming request because it's specified as middleware in the route.
 -For each part of the request (i.e., avatar and coverImage), Multer processes the file according to the storage configuration.

 -The files are saved to ./public/temp with their original names.

 3.Continuing to Next Middleware/Route Handler:
  After processing the files, Multer passes control to the next middleware function in line, which is registerUser in this case. At this point, the files are already processed and stored, so registerUser can proceed without needing to handle file uploads itself.  */

//for registering user
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 }, //use same name in formfield in frontend
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

//for user login

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refreshaccesstoken").post(refreshAccessToken);
router.route("/changepassword").post(verifyJWT, changePassword);
router.route("/getcurrentuser").get(verifyJWT, getCurrentUser);
router.route("/updateaccount").patch(verifyJWT, updateAccountDetails); // when patch is ussed only specific details we defined in controller is updated but if use post all fields are updated

router
  .route("/updateavatar")
  .patch(verifyJWT, upload.single("avatar"), updateAvatar);

router
  .route("/updatecoverimage")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);

router.route("/channelinfo/:username").get(verifyJWT, getUserChannelProfile);

router.route("/history").get(verifyJWT, getWatchHistory);

export default router;
