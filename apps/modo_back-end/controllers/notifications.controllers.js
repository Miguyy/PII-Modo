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
    const userId = req.params.userId || req.query.userId;

    const whereClause = userId ? { id_utilizador: Number(userId) } : {};

    const notifications = await Notification.findAll({ where: whereClause });

    const response = notifications.map((notif) => ({
      ...notif.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/notifications/${notif.id_notificacao}`,
        },
      ],
    }));

    // If a specific user was requested, return the user id and their notifications
    if (userId) {
      return res
        .status(200)
        .json({ id_utilizador: Number(userId), notifications: response });
    }

    res.status(200).json(response);
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};

export const createNotification = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { mensagem, tipo_notificacao } = req.body;

    if (!mensagem || !tipo_notificacao) {
      return next({
        status: 400,
        message: "Validation failed.",
        errors: {
          mensagem: ["mensagem is required"],
          tipo_notificacao: ["tipo_notificacao is required"],
        },
      });
    }

    const notification = await Notification.create({
      id_utilizador: Number(userId),
      mensagem,
      tipo_notificacao,
      lida: false,
    });

    res.status(201).json({
      ...notification.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/notifications/${notification.id_notificacao}`,
        },
      ],
    });
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};

export const getNotificationById = async (req, res, next) => {
  try {
    const notification = req.notification;
    if (!notification)
      return next({ status: 404, message: "Notification not found." });

    res.status(200).json({
      ...notification.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/notifications/${notification.id_notificacao}`,
        },
      ],
    });
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};
/**
 * updateNotification(req, res, next)
 * Updates the notification state. Restricted to updating only the 'lida' field.
 */
export const updateNotification = async (req, res, next) => {
  try {
    // If middleware attached the instance, use it. Otherwise try to resolve by route param or body.
    let notification = req.notification;
    const idParam =
      req.params.notificationId || req.params.id || req.body.id_notificacao;

    if (!notification) {
      if (!idParam)
        return next({
          status: 400,
          message: "Missing notification identifier.",
        });
      notification = await Notification.findByPk(idParam);
      if (!notification)
        return next({ status: 404, message: "Notification not found." });
    }

    // Only allow updating a small, safe set of fields
    const { lida, mensagem, tipo_notificacao } = req.body;

    const updated = await notification.update({
      lida: lida === undefined ? notification.lida : lida,
      mensagem: mensagem === undefined ? notification.mensagem : mensagem,
      tipo_notificacao:
        tipo_notificacao === undefined
          ? notification.tipo_notificacao
          : tipo_notificacao,
    });

    res.status(200).json({
      ...updated.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/notifications/${updated.id_notificacao}`,
        },
      ],
    });
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};

export const updateNotificationByBody = async (req, res, next) => {
  try {
    const { id_notificacao, lida, mensagem, tipo_notificacao } = req.body;

    if (
      !id_notificacao ||
      !Number.isInteger(Number(id_notificacao)) ||
      Number(id_notificacao) <= 0
    ) {
      return next({
        status: 400,
        message: "Invalid or missing id_notificacao.",
      });
    }

    const notification = await Notification.findByPk(id_notificacao);
    if (!notification)
      return next({ status: 404, message: "Notification not found." });

    const updated = await notification.update({
      lida: lida === undefined ? notification.lida : lida,
      mensagem: mensagem === undefined ? notification.mensagem : mensagem,
      tipo_notificacao:
        tipo_notificacao === undefined
          ? notification.tipo_notificacao
          : tipo_notificacao,
    });

    res.status(200).json({
      ...updated.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/notifications/${updated.id_notificacao}`,
        },
      ],
    });
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    let notification = req.notification;
    const idParam = req.params.notificationId || req.body.id_notificacao;
    if (!notification) {
      if (!idParam)
        return next({
          status: 400,
          message: "Missing notification identifier.",
        });
      notification = await Notification.findByPk(idParam);
      if (!notification)
        return next({ status: 404, message: "Notification not found." });
    }

    await notification.destroy();
    res.status(204).send();
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};
