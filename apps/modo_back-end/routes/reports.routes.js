import express from "express";
import {
  createReport,
  getReports,
  getReportById
} from "../controllers/reports.controllers.js";
import {
  validateCreateReport,
  validateReportId,
  checkReportExists,
} from "../middlewares/reports.middlewares.js";

const router = express.Router();

// Route to get all reports (use ?userId=X to filter by user)
router.get("/reports", getReports);

// Route to get a specific report by its ID
router.get("/reports/:id", getReportById);
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
  uploadReport.single("caminho_relatorio")
/* router.post(
  "/users/:userId/reports",
  authenticateUser,
  validateCreateReport,
  createReport, */
);

export default router;