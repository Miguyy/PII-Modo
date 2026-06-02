/*Purpose: This file defines the routes for handling notification-related operations in the application. It includes routes for retrieving user notifications and marking notifications as read. 
Each route is associated with a specific controller function that handles the corresponding operation.*/

import express from "express";
import {
  authenticateUser,
  authorizeAdmin,
} from "../middlewares/users.middlewares.js";
import {
  getAllNotifications,
  createNotification,
  getNotificationById,
  updateNotification,
  updateNotificationByBody,
  deleteNotification,
} from "../controllers/notifications.controllers.js";
import {
  validateNotificationId,
  checkNotificationExists,
  validateUpdateNotification,
} from "../middlewares/notifications.middlewares.js";
import uploadReport from "../utils/upload.utils.js";

const router = express.Router();

// GET /notifications - list all notifications (admin view)
router.get(
  "/notifications",
  authenticateUser,
  authorizeAdmin,
  getAllNotifications,
);

// Route to get all notifications for a specific user (requires auth)
router.get(
  "/users/:userId/notifications",
  authenticateUser,
  getAllNotifications,
);

// Create a notification for a user
router.post(
  "/users/:userId/notifications",
  authenticateUser,
  authorizeAdmin,
  createNotification,
);

// Get a notification by id
router.get(
  "/notifications/:notificationId",
  authenticateUser,
  validateNotificationId,
  checkNotificationExists,
  getNotificationById,
);

// Route to mark a specific notification as read (requires auth)
// Patch by route param: /notifications/:notificationId
router.patch(
  "/notifications/:notificationId",
  authenticateUser,
  uploadReport.none(),
  validateNotificationId,
  checkNotificationExists,
  validateUpdateNotification,
  updateNotification,
);

// Patch by body (accepts `{ id_notificacao, ... }`)
/* router.patch(
  "/notifications",
  authenticateUser,
  validateUpdateNotification,
  updateNotificationByBody,
); */

// Delete a notification
router.delete(
  "/notifications/:notificationId",
  authenticateUser,
  authorizeAdmin,
  validateNotificationId,
  checkNotificationExists,
  deleteNotification,
);

export default router;
