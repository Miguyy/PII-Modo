import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.C_CLOUD_NAME,
  api_key: process.env.C_API_KEY,
  api_secret: process.env.C_API_SECRET,
});

/**
 * Storage configuration for user profile pictures
 */
const userProfileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "modo/user-profiles",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [{ width: 500, height: 500, crop: "fill" }],
  },
});

/**
 * Storage configuration for avatar decorations
 */
const decorationStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "modo/decorations",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "svg"],
    transformation: [{ width: 300, height: 300, crop: "fill" }],
  },
});

/**
 * Storage configuration for reports (PDF, images, documents)
 */
const reportStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "modo/reports",
    allowed_formats: ["pdf", "jpg", "jpeg", "png", "doc", "docx"],
    resource_type: "auto",
  },
});

/**
 * Multer upload instances
 */
export const uploadUserProfile = multer({
  storage: userProfileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed."));
    }
  },
});

export const uploadDecoration = multer({
  storage: decorationStorage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/svg+xml",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, GIF, and SVG are allowed."
        )
      );
    }
  },
});

export const uploadReport = multer({
  storage: reportStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only PDF, images, and Word documents are allowed."
        )
      );
    }
  },
});
