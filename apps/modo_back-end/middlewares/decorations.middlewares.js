/*
  Purpose: Validation and existence-check middleware for Decoration
  endpoints. Exports middleware to validate input payloads, validate
  decoration ID params, and attach decoration instances to `req` when found.
*/

import { Decoration } from "../config/db.config.js";

/**
 * validateCreateDecoration(req, res, next)
 * Validates the request body when creating a Decoration. Checks that
 * `nome_decoracao`, `nivel_necessario`, and `caminho_decoracao` are valid.
 */
export const validateCreateDecoration = (req, res, next) => {
  const { nome_decoracao, nivel_necessario, caminho_decoracao } = req.body;
  const errors = {};

  if (!nome_decoracao || typeof nome_decoracao !== "string" || nome_decoracao.trim() === "") {
    errors.nome_decoracao = ["Decoration name is mandatory."];
  }

  if (nivel_necessario === undefined || !Number.isInteger(Number(nivel_necessario)) || Number(nivel_necessario) < 0) {
    errors.nivel_necessario = ["Required level is mandatory and must be a positive integer or zero."];
  }

  if (!caminho_decoracao || typeof caminho_decoracao !== "string" || caminho_decoracao.trim() === "") {
    errors.caminho_decoracao = ["Decoration path is mandatory."];
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
 * validateDecorationId(req, res, next)
 * Validates that the `decorationId` route parameter is a positive integer.
 */
export const validateDecorationId = (req, res, next) => {
  const { decorationId } = req.params;

  if (!Number.isInteger(Number(decorationId)) || Number(decorationId) <= 0) {
    return res.status(400).json({
      description: "Invalid request.",
      errors: { decorationId: ["Invalid decoration ID format."] },
    });
  }
  next();
};

/**
 * checkDecorationExists(req, res, next)
 * Loads a Decoration by `decorationId` and attaches it to `req.decoration`.
 */
export const checkDecorationExists = async (req, res, next) => {
  const { decorationId } = req.params;
  const decoration = await Decoration.findByPk(decorationId);

  if (!decoration) {
    return res.status(404).json({
      description: "Resource not found.",
      errors: { decorationId: ["Decoration not found."] },
    });
  }

  req.decoration = decoration;
  next();
};