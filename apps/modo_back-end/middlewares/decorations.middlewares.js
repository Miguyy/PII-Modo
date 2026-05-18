/*
  Purpose: Middleware utilities for Decoration-related routes. Exposes
  validation middleware for route parameters and payload used by decoration handlers.
*/
import { Decoration } from "../config/db.config.js";

/**
 * validateCreateDecoration(req, res, next)
 * Validates the required fields and data types for creating a new decoration.
 * Responds with HTTP 400 and an error object when invalid, otherwise calls `next()`.
 */
export const validateCreateDecoration = (req, res, next) => {
  const { nome, nivel_necessario, preco_pontos } = req.body;
  const errors = {};

  if (!nome || typeof nome !== "string" || nome.trim() === "") {
    errors.nome = ["Decoration name is mandatory."];
  }

  if (nivel_necessario !== undefined && (!Number.isInteger(nivel_necessario) || nivel_necessario < 0)) {
    errors.nivel_necessario = ["Required level must be a positive integer."];
  }

  if (preco_pontos !== undefined && (!Number.isInteger(preco_pontos) || preco_pontos < 0)) {
    errors.preco_pontos = ["Points price must be a positive integer."];
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ description: "Validation failed.", errors });
  }
  next();
};

/**
 * validateDecorationId(req, res, next)
 * Validates that the `id` route parameter is a positive integer.
 * Responds with HTTP 400 and an error object when invalid, otherwise calls `next()`.
 */
export const validateDecorationId = (req, res, next) => {
  const { id } = req.params;
  
  if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({
      description: "Invalid request.",
      errors: { id: ["Invalid decoration ID format."] },
    });
  }
  next();
};