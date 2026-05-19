/*
  Purpose: Middleware utilities for Location-related routes. Exposes
  validation and check middleware used by location handlers.
*/
import { Location } from "../config/db.config.js";

/**
 * validateCreateLocation(req, res, next)
 * Validates the request body for creating or updating a location, checking for required 
 * fields and valid GPS coordinate bounds.
 * Responds with HTTP 400 and an error object when invalid, otherwise calls `next()`.
 */
export const validateCreateLocation = (req, res, next) => {
  // Alterado de nome_localizacao para pais e cidade
  const { pais, cidade, latitude, longitude } = req.body;
  const errors = {};

  if (!pais || typeof pais !== "string" || pais.trim() === "") {
    errors.pais = ["Country (pais) is mandatory."];
  }

  if (!cidade || typeof cidade !== "string" || cidade.trim() === "") {
    errors.cidade = ["City (cidade) is mandatory."];
  }

  if (latitude === undefined || isNaN(latitude) || latitude < -90 || latitude > 90) {
    errors.latitude = ["Invalid latitude. Must be a number between -90 and 90."];
  }

  if (longitude === undefined || isNaN(longitude) || longitude < -180 || longitude > 180) {
    errors.longitude = ["Invalid longitude. Must be a number between -180 and 180."];
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ description: "Validation failed.", errors });
  }
  next();
};

/**
 * validateLocationId(req, res, next)
 * Validates that the `locationId` route parameter is a positive integer.
 * Responds with HTTP 400 and an error object when invalid, otherwise calls `next()`.
 */
export const validateLocationId = (req, res, next) => {
  const { locationId } = req.params;
  
  if (!Number.isInteger(Number(locationId)) || Number(locationId) <= 0) {
    return res.status(400).json({
      description: "Invalid request.",
      errors: { locationId: ["Invalid location ID format."] },
    });
  }
  next();
};

/**
 * checkLocationExists(req, res, next)
 * Verifies if the location exists in the database based on the `locationId`.
 * Responds with HTTP 404 when the location is not found, otherwise attaches
 * the location object to `req` and calls `next()`.
 */
export const checkLocationExists = async (req, res, next) => {
  const { locationId } = req.params;
  const location = await Location.findByPk(locationId);

  if (!location) {
    return res.status(404).json({
      description: "Resource not found.",
      errors: { locationId: ["Location not found."] },
    });
  }
  
  req.location = location; // Attach for potential use in controllers
  next();
};