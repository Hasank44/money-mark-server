import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "money-mark",
  },
});

export const upload = multer({ storage });

export const taskUpload = upload.fields([
  { name: "firstScreenshot", maxCount: 1 },
  { name: "secondScreenshot", maxCount: 1 },
]);
