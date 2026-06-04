import multer from "multer";

// Use memory storage so uploaded files are available as `req.file.buffer`
const storage = multer.memoryStorage();

// Accept PDFs, common image/document types and plain text (for generated reports)
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type."), false);
  }
};

// Limit uploads to 20 MB by default
const limits = { fileSize: 20 * 1024 * 1024 };

export const uploadReport = multer({ storage, fileFilter, limits });

export default uploadReport;
