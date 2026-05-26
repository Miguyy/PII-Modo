/*
  Purpose: HTTP controllers for Notifications.
  Exports functions to list, create, read, update (mark as read), and delete notifications.
  Includes protections against Mass Assignment by destructuring req.body.
*/

import { Notification } from "../config/db.config.js";

/**
 * getAllNotifications(req, res, next)
 * Retrieves all notifications. Can be filtered by `userId` if provided in the query string.
 */
export const getAllNotifications = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const whereClause = userId ? { userId } : {};

    const notifications = await Notification.findAll({ where: whereClause });

    const response = notifications.map((notif) => ({
      ...notif.toJSON(),
      links: [
        { rel: "self", method: "GET", href: `/notifications/${notif.id}` },
      ],
    }));

    res.status(200).json(response);
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};

/**
 * createNotification(req, res, next)
 * Creates a new notification. Destructures the payload to prevent mass assignment vulnerabilities.
 */
/* export const createNotification = async (req, res, next) => {
  try {
    // Security Protection: Extract only the allowed fields
    // Note: Adjust 'titulo' and 'mensagem' if your database column names differ
    const { userId, titulo, mensagem } = req.body;

    const notification = await Notification.create({
      userId,
      titulo,
      mensagem,
      lida: false,
    });

    res.status(201).json({
      ...notification.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/notifications/${notification.id}`,
        },
      ],
    });
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};
 */
/**
 * getNotificationById(req, res, next)
 * Returns the notification attached to `req.notification` by the middleware.
 */
/* export const getNotificationById = async (req, res, next) => {
  try {
    const notification = req.notification;

    res.status(200).json({
      ...notification.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/notifications/${notification.id}`,
        },
      ],
    });
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};
 */
/**
 * updateNotification(req, res, next)
 * Updates the notification state. Restricted to updating only the 'lida' field.
 */
export const updateNotification = async (req, res, next) => {
  try {
    const notification = req.notification;

    // Security Protection: Ensure the user can only update the read status
    const { lida } = req.body;

    const updated = await notification.update({
      lida: lida ?? notification.lida,
    });

    res.status(200).json({
      ...updated.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/notifications/${notification.id}`,
        },
      ],
    });
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};

/**
 * deleteNotification(req, res, next)
 * Deletes the notification attached to `req.notification`.
 */
/* export const deleteNotification = async (req, res, next) => {
  try {
    const notification = req.notification;

    await notification.destroy();

    res.status(204).send();
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};
 */
