/*Purpose: This file defines the routes for managing user reports in the application. It includes routes for creating a new report for a specific user, retrieving all reports (with optional filtering by user),
and retrieving a specific report by its ID. Each route is associated with a specific controller function that handles the corresponding operation. 
The routes are designed to be nested under a user-specific path for creating reports, allowing for operations that are specific to a particular user.*/

import express from "express";
import {
  createReport,
  getReports,
  getReportById,
} from "../controllers/reports.controllers.js";

const router = express.Router();

// Route to get all reports (use ?userId=X to filter by user)
router.get("/reports", getReports);

// Route to get a specific report by its ID
router.get("/reports/:id", getReportById);

// Route to create a new report for a specific user
router.post("/users/:userId/reports", createReport);

export default router;
