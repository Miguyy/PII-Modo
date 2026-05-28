/*
  Purpose: Controller functions to manage the association between users
  and their unlocked decorations.
*/

import { UserDecorations } from "../config/db.config.js";

/**
 * getAllUserDecorations(req, res, next)
 * Retrieves all UserDecoration records for a specific user.
 */
export const getAllUserDecorations = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const userDecorations = await UserDecorations.findAll({
      where: { id_utilizador: userId },
    });

    const response = userDecorations.map((ud) => ({
      ...ud.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/users/${userId}/avatar-decorations/${ud.id_decoracao}`,
        },
      ],
    }));

    res.status(200).json(response);
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};

/**
 * assignDecorationToUser(req, res, next)
 * Assigns a decoration to a user (unlocks it).
 */
export const assignDecorationToUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Security Protection: Extract only the id_decoracao
    const { id_decoracao } = req.body;

    // authorization: only the user themself or admin can assign decorations
    const requester = req.user;
    const requesterRole = (
      (requester &&
        (requester.tipo_utilizador || requester.dataValues?.tipo_utilizador)) ||
      ""
    ).toLowerCase();
    const requesterId =
      requester &&
      (requester.id_utilizador || requester.dataValues?.id_utilizador);
    if (requesterRole !== "admin" && Number(requesterId) !== Number(userId)) {
      return next({ status: 403, message: "Forbidden." });
    }

    const existing = await UserDecorations.findOne({
      where: { id_utilizador: userId, id_decoracao: id_decoracao },
    });

    if (existing) {
      return next({
        status: 409,
        message: "Resource conflict.",
        errors: { userDecoration: ["Decoration already assigned to user."] },
      });
    }

    // If there's already any record for this user, don't overwrite it here.
    const anyForUser = await UserDecorations.findOne({
      where: { id_utilizador: userId },
    });
    if (anyForUser) {
      return next({
        status: 409,
        message: "Resource conflict.",
        errors: {
          userDecoration: [
            "User already has a decoration. Use PATCH to change it.",
          ],
        },
      });
    }

    const userDecoration = await UserDecorations.create({
      id_utilizador: userId,
      id_decoracao: id_decoracao,
    });

    res.status(201).json({
      ...userDecoration.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/users/${userId}/avatar-decorations/${id_decoracao}`,
        },
      ],
    });
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};

/**
 * getUserDecorationById(req, res, next)
 * Returns the `req.userDecoration` record attached by middleware.
 */
/* export const getUserDecorationById = async (req, res, next) => {
  try {
    const userDecoration = req.userDecoration;

    res.status(200).json({
      ...userDecoration.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/users/${userDecoration.userId}/avatar-decorations/${userDecoration.decorationId}`,
        },
      ],
    });
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
}; */

/**
 * updateUserDecoration(req, res, next)
 * Updates the `ativo` state of a user's decoration (e.g., equipping it).
 */
export const updateUserDecoration = async (req, res, next) => {
  try {
    const { userId, decorationId } = req.params;

    // authorization: only the user themself or admin can update decorations
    const requester = req.user;
    const requesterRole = (
      (requester &&
        (requester.tipo_utilizador || requester.dataValues?.tipo_utilizador)) ||
      ""
    ).toLowerCase();
    const requesterId =
      requester &&
      (requester.id_utilizador || requester.dataValues?.id_utilizador);
    if (requesterRole !== "admin" && Number(requesterId) !== Number(userId)) {
      return next({ status: 403, message: "Forbidden." });
    }

    // The PATCH is intended to change the decoration for the user: old -> new
    const userDecoration = await UserDecorations.findOne({
      where: { id_utilizador: userId, id_decoracao: decorationId },
    });
    if (!userDecoration)
      return next({ status: 404, message: "User decoration not found." });

    const { id_decoracao } = req.body;
    if (!id_decoracao || Number(id_decoracao) <= 0)
      return next({ status: 400, message: "Invalid id_decoracao." });

    // ensure there's no conflict (another row with same user and id_decoracao)
    const conflict = await UserDecorations.findOne({
      where: { id_utilizador: userId, id_decoracao },
    });
    if (conflict)
      return next({
        status: 409,
        message: "User already has that decoration.",
      });

    await userDecoration.update({ id_decoracao });

    res.status(200).json({
      ...userDecoration.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/users/${userDecoration.id_utilizador}/avatar-decorations/${userDecoration.id_decoracao}`,
        },
      ],
    });
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};
