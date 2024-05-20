import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
const router = Router();

//just before calling  registerUser we call multer upload middleware

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 }, //use same name in formfield in frontend
    { name: "coverImage", maxCount: 1 },
  ]),

  registerUser
);

export default router;
