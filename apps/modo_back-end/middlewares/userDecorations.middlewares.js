/*
  Purpose: Validation and existence-check middleware for endpoints
  managing decorations assigned to users.
*/

import { UserDecorations } from "../config/db.config.js";

/**
 * validateUserDecorationIds(req, res, next)
 * Validates `userId` and `decorationId` route parameters.
 */
export const validateUserDecorationIds = (req, res, next) => {
  const { userId, decorationId } = req.params;
  const errors = {};

  if (!Number.isInteger(Number(userId)) || Number(userId) <= 0) {
    errors.userId = ["Invalid user ID."];
  }

  if (
    decorationId &&
    (!Number.isInteger(Number(decorationId)) || Number(decorationId) <= 0)
  ) {
    errors.decorationId = ["Invalid decoration ID."];
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
 * validateUpdateUserDecoration(req, res, next)
 * Validates the payload when updating a user's decoration (e.g., setting it as active).
 */
export const validateUpdateUserDecoration = (req, res, next) => {
  const { ativo } = req.body;
  const errors = {};

  if (ativo !== undefined && typeof ativo !== "boolean") {
    errors.ativo = ["'ativo' must be a boolean value (true or false)."];
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
 * checkUserDecorationExists(req, res, next)
 * Loads a UserDecoration by `userId` and `decorationId`.
 */
export const checkUserDecorationExists = async (req, res, next) => {
  const { userId, decorationId } = req.params;

  const userDecoration = await UserDecoration.findOne({
    where: { userId, decorationId },
  });

  if (!userDecoration) {
    return res.status(404).json({
      description: "Resource not found.",
      errors: { userDecoration: ["User decoration not found."] },
    });
  }

  req.userDecoration = userDecoration;
  next();
};
