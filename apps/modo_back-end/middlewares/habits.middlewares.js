/*
  Purpose: Validation and existence-check middleware for Habit
  endpoints. Exports middleware to validate input payloads, validate
  habit ID params, and attach habit instances to `req` when found.
*/

import { Habit } from "../config/db.config.js";

/**
 * validateCreateHabit(req, res, next)
 * Validates the request body when creating a Habit. Checks that
 * `nome` is a non-empty string and optional fields, if provided,
 * have valid types. Returns 400 with error details on validation
 * failure; otherwise calls `next()`.
 */
export const validateCreateHabit = (req, res, next) => {
  const { nome, descricao_habito, categoria } = req.body;
  const errors = {};

  if (!nome || typeof nome !== "string" || nome.trim() === "") {
    errors.nome = ["Name is mandatory."];
  }

  if (descricao_habito && typeof descricao_habito !== "string") {
    errors.descricao_habito = ["Invalid description value."];
  }

  if (categoria && typeof categoria !== "string") {
    errors.categoria = ["Invalid category value."];
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
 * validateHabitId(req, res, next)
 * Validates that the `habitId` route parameter is a positive integer.
 * Returns HTTP 400 with details when invalid, otherwise calls
 * `next()`.
 */
export const validateHabitId = async (req, res, next) => {
  const { habitId } = req.params;

  if (!habitId || isNaN(parseInt(habitId) || parseInt(habitId) <= 0)) {
    return res.status(400).json({
      description: "Validation failed.",
      errors: { habitId: ["Invalid habit ID format."] },
    });
  }
  next();
};

/**
 * checkHabitExists(req, res, next)
 * Middleware that loads the Habit by `habitId` and attaches it to
 * `req.habit`. If not found, responds with 404 and an error object.
 */
export const checkHabitExists = async (req, res, next) => {
  const { habitId } = req.params;
  const habit = await Habit.findByPk(habitId);

  if (!habit) {
    return res.status(404).json({
      description: "Resource not found.",
      errors: { habitId: ["Habit with the specified ID does not exist."] },
    });
  }

  req.habit = habit; // Attach the habit to the request object for use in controllers

  next();
};
