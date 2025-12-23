import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import 'dotenv/config';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadToCloudinary = (buffer, folder = "default") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const deleteFromCloudinary = async (public_id) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return result;
  } catch (err) {
    throw err;
  };
};

export const singleFileUpload = (fieldName, folder = "default") => {
  return [
    upload.single(fieldName),
    async (req, res, next) => {
      if (!req.file) return next();
      try {
        const result = await uploadToCloudinary(req.file.buffer, folder);
        req.file.cloudinary = result;
        next();
      } catch (err) {
        next(err);
      };
    },
  ];
};

export const multiFilesUpload = (fieldName, maxCount = 5, folder = "default") => {
  return [
    upload.array(fieldName, maxCount),
    async (req, res, next) => {
      if (!req.files || req.files.length === 0) return next();
      try {
        const uploadedFiles = [];
        for (let file of req.files) {
          const result = await uploadToCloudinary(file.buffer, folder);
          uploadedFiles.push({ ...file, cloudinary: result });
        };
        req.files = uploadedFiles;
        next();
      } catch (err) {
        next(err);
      };
    },
  ];
};