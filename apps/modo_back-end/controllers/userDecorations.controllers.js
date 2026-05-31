/*
  Purpose: Controller functions to manage the association between users
  and their unlocked decorations.
*/

import { UserDecorations } from "../config/db.config.js";
import {
  validationError,
  forbiddenError,
  notFoundError,
  conflictError,
  genericError,
} from "../utils/errors.utils.js";

/**
 * getAllUserDecorations(req, res, next)
 * Retrieves all UserDecoration records for a specific user.
 */
export const getAllUserDecorations = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Authorization: only admin or the owner can list decorations
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
      return next(forbiddenError());
    }

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
    console.error(error);
    return next(genericError());
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
      return next(forbiddenError());
    }

    const existing = await UserDecorations.findOne({
      where: { id_utilizador: userId, id_decoracao: id_decoracao },
    });

    if (existing) {
      return next(
        conflictError({
          userDecoration: ["Decoration already assigned to user."],
        }),
      );
    }

    // If there's already any record for this user, don't overwrite it here.
    const anyForUser = await UserDecorations.findOne({
      where: { id_utilizador: userId },
    });
    if (anyForUser) {
      // If the user row exists but has a null decoration, allow creating by setting that row.
      if (anyForUser.id_decoracao === null) {
        await anyForUser.update({ id_decoracao: id_decoracao });
        return res.status(200).json({
          ...anyForUser.toJSON(),
          links: [
            {
              rel: "self",
              method: "GET",
              href: `/users/${userId}/avatar-decorations/${id_decoracao}`,
            },
          ],
        });
      }

      return next(
        conflictError({
          userDecoration: [
            "User already has a decoration. Use PATCH to change it.",
          ],
        }),
      );
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
    console.error(error);
    return next(genericError());
  }
};

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
      return next(forbiddenError());
    }

    // The PATCH is intended to change the decoration for the user: old -> new
    const userDecoration = await UserDecorations.findOne({
      where: { id_utilizador: userId, id_decoracao: decorationId },
    });
    if (!userDecoration) {
      // If there is a user row but its id_decoracao is null, guide client to use body-PATCH
      const anyForUser = await UserDecorations.findOne({
        where: { id_utilizador: userId },
      });
      if (anyForUser && anyForUser.id_decoracao === null) {
        return next(
          validationError({
            id_decoracao: [
              "Current decoration is null. Use PATCH /:userId/avatar-decorations with body { id_decoracao }.",
            ],
          }),
        );
      }
      return next(notFoundError("UserDecoration", `${userId}:${decorationId}`));
    }

    const { id_decoracao } = req.body;

    // allow unsetting the decoration with null
    if (
      id_decoracao === null ||
      id_decoracao === "null" ||
      id_decoracao === ""
    ) {
      try {
        await userDecoration.update({ id_decoracao: null });
        return res.status(200).json({
          ...userDecoration.toJSON(),
          links: [
            {
              rel: "self",
              method: "GET",
              href: `/users/${userDecoration.id_utilizador}/avatar-decorations/${userDecoration.id_decoracao}`,
            },
          ],
        });
      } catch (err) {
        // If DB does not allow null for id_decoracao, remove the row instead
        if (err?.parent?.code === "ER_BAD_NULL_ERROR") {
          await userDecoration.destroy();
          return res
            .status(200)
            .json({ id_utilizador: Number(userId), id_decoracao: null });
        }
        throw err;
      }
    }

    if (!id_decoracao || Number(id_decoracao) <= 0)
      return next(validationError({ id_decoracao: ["Invalid id_decoracao."] }));

    // ensure there's no conflict (another row with same user and id_decoracao)
    const conflict = await UserDecorations.findOne({
      where: { id_utilizador: userId, id_decoracao },
    });
    if (conflict)
      return next(
        conflictError({
          userDecoration: ["User already has that decoration."],
        }),
      );

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
    console.error(error);
    return next(genericError());
  }
};

/**
 * updateUserDecorationByBody(req, res, next)
 * Allows updating the user's decoration by sending `{ id_decoracao }` in the body.
 * This is useful when the current stored `id_decoracao` is null and there is
 * no decorationId route param to target.
 */
export const updateUserDecorationByBody = async (req, res, next) => {
  try {
    const { userId } = req.params;

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
      return next(forbiddenError());
    }

    // Find the existing UserDecorations row for this user
    const userDecoration = await UserDecorations.findOne({
      where: { id_utilizador: Number(userId) },
    });
    if (!userDecoration) return next(notFoundError("UserDecoration", userId));

    const { id_decoracao } = req.body;

    // allow unsetting the decoration with null
    if (
      id_decoracao === null ||
      id_decoracao === "null" ||
      id_decoracao === ""
    ) {
      try {
        await userDecoration.update({ id_decoracao: null });
        return res.status(200).json({
          ...userDecoration.toJSON(),
          links: [
            {
              rel: "self",
              method: "GET",
              href: `/users/${userDecoration.id_utilizador}/avatar-decorations/${userDecoration.id_decoracao}`,
            },
          ],
        });
      } catch (err) {
        if (err?.parent?.code === "ER_BAD_NULL_ERROR") {
          await userDecoration.destroy();
          return res
            .status(200)
            .json({ id_utilizador: Number(userId), id_decoracao: null });
        }
        throw err;
      }
    }

    if (!id_decoracao || Number(id_decoracao) <= 0)
      return next(validationError({ id_decoracao: ["Invalid id_decoracao."] }));

    // ensure there's no conflict (another row with same user and id_decoracao)
    const conflict = await UserDecorations.findOne({
      where: { id_utilizador: Number(userId), id_decoracao },
    });
    if (conflict)
      return next(
        conflictError({
          userDecoration: ["User already has that decoration."],
        }),
      );

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
    console.error(error);
    return next(genericError());
  }
};
