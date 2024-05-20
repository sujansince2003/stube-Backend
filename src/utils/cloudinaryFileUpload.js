import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// function to upload file

const uploadtocloudinary = async (localFilepath) => {
  try {
    if (!localFilepath) return null;
    const response = await cloudinary.uploader.upload(localFilepath, {
      resource_type: "auto",
    });
    // file has been uploaded successfull so removing from local server
    console.log("File is successfully uploaded to cloudinary");
    // Delete the temporary file from the local filesystem
    fs.unlinkSync(localFilepath); // Safely delete the file
    return response;
  } catch (error) {
    fs.unlinkSync(localFilepath); //remove the temporarily saved file  as the upload operation got failed
    return null;
  }
};

export { uploadtocloudinary };
