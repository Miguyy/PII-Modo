/*
  Purpose: Middleware utilities for UserDecoration-related routes. Exposes
  validation middleware to check ownership and associations for user decorations.
*/
import { UserDecoration } from "../config/db.config.js";

/**
 * checkUserDecorationExists(req, res, next)
 * Validates if the specified user owns the specified decoration in their inventory.
 * Responds with HTTP 404 and an error object when the association is not found, 
 * otherwise calls `next()`.
 */
export const checkUserDecorationExists = async (req, res, next) => {
  const { userId, decorationId } = req.params;

  const userDecoration = await UserDecoration.findOne({
    where: { userId, decorationId },
  });

  if (!userDecoration) {
    return res.status(404).json({
      description: "Resource not found.",
      errors: { userDecoration: ["User does not own this decoration."] },
    });
  }

  req.userDecoration = userDecoration;
  next();
};