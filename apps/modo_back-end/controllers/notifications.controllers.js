// Import models (adjust according to the exact names exported in your db.config.js)
import { Notification, User } from "../config/db.config.js";

// Controller to list all notifications for a specific user
// GET /users/:userId/notifications
export const getUserNotifications = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Check if the user exists
    const user = await User.findByPk(userId);
    if (!user) {
      const err = new Error("User not found.");
      err.status = 404;
      return next(err);
    }

    // Fetch the notifications for this user
    const notifications = await Notification.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]], // Most recent notifications first
    });

    // Include HATEOAS links in the response
    const response = notifications.map((notif) => ({
      ...notif.toJSON(),
      links: {
        mark_as_read: `/notifications/${notif.id}`, // Link to the PATCH endpoint
      },
    }));

    res.status(200).json(response);
  } catch (error) {
    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};

// Controller to mark a notification as read
// PATCH /notifications/:id
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the specific notification
    const notification = await Notification.findByPk(id);

    if (!notification) {
      const err = new Error("Notification not found.");
      err.status = 404;
      return next(err);
    }

    // Update the status (assuming the column is named 'lida' or 'is_read')
    // Adjust 'lida' to your exact database column name if different
    notification.lida = true;
    await notification.save();

    // Include HATEOAS links in the response
    const response = {
      ...notification.toJSON(),
      links: {
        user_notifications: `/users/${notification.userId}/notifications`,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const err = new Error("Validation error.");
      err.status = 400;
      err.errors = error.errors.map((e) => e.message);
      return next(err);
    }
    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};
