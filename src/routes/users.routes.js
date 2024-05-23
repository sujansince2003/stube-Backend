import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
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

export default router;
