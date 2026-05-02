import express from "express";
import {
  getUserNotifications,
  markAsRead
} from "../controllers/notifications.controllers.js";

const router = express.Router();

// Route to get all notifications for a specific user
router.get("/users/:userId/notifications", getUserNotifications);

// Route to mark a specific notification as read
router.patch("/notifications/:id", markAsRead);

export default router;