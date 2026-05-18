/*
  Purpose: Middleware utilities for Notification-related routes. Exposes
  validation and authorization middleware used by notification handlers.
*/
import { Notification } from "../config/db.config.js";

/**
 * validateNotificationId(req, res, next)
 * Validates that the `id_notificacao` route parameter is a positive integer.
 * Responds with HTTP 400 and an error object when invalid, otherwise calls `next()`.
 */
export const validateNotificationId = (req, res, next) => {
  const { id_notificacao } = req.params;
  
  if (!Number.isInteger(Number(id_notificacao)) || Number(id_notificacao) <= 0) {
    return res.status(400).json({
      description: "Invalid request.",
      errors: { id_notificacao: ["Invalid notification ID format."] },
    });
  }
  next();
};

/**
 * checkNotificationOwnership(req, res, next)
 * Verifies that the notification exists and belongs to the authenticated user.
 * Responds with HTTP 404 if not found, HTTP 403 if access is forbidden, 
 * otherwise calls `next()`.
 */
export const checkNotificationOwnership = async (req, res, next) => {
  const { id_notificacao } = req.params;
  const notification = await Notification.findByPk(id_notificacao);

  if (!notification) {
    return res.status(404).json({
      description: "Resource not found.",
      errors: { notification: ["Notification not found."] },
    });
  }

  // Assuming `req.user` is populated by the `authenticateUser` middleware
  if (req.user && notification.userId !== req.user.id && req.user.tipo_utilizador !== "admin") {
    return res.status(403).json({
      description: "Forbidden.",
      errors: { access: ["You do not have permission to access this notification."] },
    });
  }

  next();
};