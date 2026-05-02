import express from "express";
import {
  createReport,
  getReports,
  getReportById
} from "../controllers/reports.controllers.js";

const router = express.Router();

// Route to get all reports (use ?userId=X to filter by user)
router.get("/reports", getReports);

// Route to get a specific report by its ID
router.get("/reports/:id", getReportById);

// Route to create a new report for a specific user
router.post("/users/:userId/reports", createReport);

export default router;