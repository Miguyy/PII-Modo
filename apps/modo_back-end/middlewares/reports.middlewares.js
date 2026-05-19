/*
  Purpose: Middleware utilities for Report-related routes. Exposes
  validation middleware for request payload used by report handlers.
*/

/**
 * validateCreateReport(req, res, next)
 * Validates the required string fields `titulo` and `periodo` for report creation.
 * Responds with HTTP 400 and an error object when invalid, otherwise calls `next()`.
 */
export const validateCreateReport = (req, res, next) => {
  const { titulo, periodo } = req.body;
  const errors = {};

  if (!titulo || typeof titulo !== "string" || titulo.trim() === "") {
    errors.titulo = ["Report title is mandatory."];
  }

  if (!periodo || typeof periodo !== "string" || periodo.trim() === "") {
    errors.periodo = ["Report period is mandatory."];
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ 
      description: "Validation failed.", 
      errors 
    });
  }
  next();
};