/*Purpose: This file defines the routes for handling notification-related operations in the application. It includes routes for retrieving user notifications and marking notifications as read. 
Each route is associated with a specific controller function that handles the corresponding operation.*/

import express from "express";
import {
  getAllNotifications,
  updateNotification,
} from "../controllers/notifications.controllers.js";

const router = express.Router();

// Route to get all notifications for a specific user
router.get("/users/:userId/notifications", getAllNotifications);

// Route to mark a specific notification as read
router.patch("/notifications/:id", updateNotification);

export default router;
