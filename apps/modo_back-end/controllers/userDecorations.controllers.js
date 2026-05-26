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

    const userDecorations = await UserDecoration.findAll({
      where: { userId },
    });

    const response = userDecorations.map((ud) => ({
      ...ud.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/users/${userId}/avatar-decorations/${ud.decorationId}`,
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

    // Security Protection: Extract only the decorationId
    const { decorationId } = req.body;

    const existing = await UserDecoration.findOne({
      where: { userId, decorationId },
    });

    if (existing) {
      return next({
        status: 409,
        message: "Resource conflict.",
        errors: { userDecoration: ["Decoration already assigned to user."] },
      });
    }

    const userDecoration = await UserDecoration.create({
      userId,
      decorationId,
      ativo: false,
    });

    res.status(201).json({
      ...userDecoration.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/users/${userId}/avatar-decorations/${decorationId}`,
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
    const userDecoration = req.userDecoration;

    // Security Protection: Extract only the 'ativo' field
    const { ativo } = req.body;

    await userDecoration.update({
      ativo: typeof ativo === "boolean" ? ativo : userDecoration.ativo,
    });

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
};
