/*
  Purpose: Validation and existence-check middleware for Notification
  endpoints.
*/

import { Notification } from "../config/db.config.js";

/**
 * validateNotificationId(req, res, next)
 * Validates that the `notificationId` route parameter is a positive integer.
 */
export const validateNotificationId = (req, res, next) => {
  const { notificationId } = req.params;

  if (
    !Number.isInteger(Number(notificationId)) ||
    Number(notificationId) <= 0
  ) {
    return res.status(400).json({
      description: "Invalid request.",
      errors: { notificationId: ["Invalid notification ID format."] },
    });
  }
  next();
};

/**
 * validateUpdateNotification(req, res, next)
 * Validates the payload when updating a notification (e.g., marking as read).
 */
export const validateUpdateNotification = (req, res, next) => {
  let { lida } = req.body;
  const errors = {};

  // Accept boolean or boolean-like values (e.g., "true"/"false" from form-data)
  if (lida === undefined) {
    errors.lida = ["'lida' is mandatory and must be a boolean value."];
  } else {
    if (typeof lida === "string") {
      const lowered = lida.toLowerCase();
      if (lowered === "true") lida = true;
      else if (lowered === "false") lida = false;
    }
    if (typeof lida !== "boolean") {
      errors.lida = ["'lida' is mandatory and must be a boolean value."];
    } else {
      // replace body value with coerced boolean
      req.body.lida = lida;
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      description: "Validation failed.",
      errors,
    });
  }
  next();
};

/**
 * checkNotificationExists(req, res, next)
 * Loads a Notification by `notificationId` and attaches it to `req.notification`.
 */
export const checkNotificationExists = async (req, res, next) => {
  const { notificationId } = req.params;
  const notification = await Notification.findByPk(notificationId);

  if (!notification) {
    return res.status(404).json({
      description: "Resource not found.",
      errors: { notificationId: ["Notification not found."] },
    });
  }

  req.notification = notification;
  next();
};
