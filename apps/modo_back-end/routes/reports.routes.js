/*Purpose: This file defines the routes for managing user reports in the application. It includes routes for creating a new report for a specific user, retrieving all reports (with optional filtering by user),
and retrieving a specific report by its ID. Each route is associated with a specific controller function that handles the corresponding operation. 
The routes are designed to be nested under a user-specific path for creating reports, allowing for operations that are specific to a particular user.*/

import express from "express";
import { uploadReport } from "../utils/upload.utils.js";
import { authenticateUser } from "../middlewares/users.middlewares.js";
import {
  createReport,
  getAllReports,
  getReportById,
} from "../controllers/reports.controllers.js";
import {
  validateCreateReport,
  validateReportId,
  checkReportExists,
} from "../middlewares/reports.middlewares.js";

const router = express.Router();

// Route to get all reports (use ?userId=X to filter by user) (requires auth)
router.get("/reports", authenticateUser, getAllReports);

// Route to get a specific report by its ID (requires auth)
router.get(
  "/reports/:reportId",
  authenticateUser,
  validateReportId,
  checkReportExists,
  getReportById,
);

// Route to create a new report for a specific user (requires auth)
// Optionally accepts a report file upload (PDF, images, documents)
router.post(
  "/users/:userId/reports",
  authenticateUser,
  uploadReport.single("caminho_relatorio"),
  createReport,
);

export default router;
