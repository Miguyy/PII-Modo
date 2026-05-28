/*
  Purpose: Validation middleware for Location endpoints. Provides
  payload validation for coordinates and city.
*/

import { Location } from "../config/db.config.js";

/**
 * validateLocationPayload(req, res, next)
 * Validates request body fields when creating or updating a Location.
 * Requires numeric `latitude` and `longitude`. `cidade` is optional.
 */
export const validateLocationPayload = (req, res, next) => {
  const body = req.body || {};
  let { latitude, longitude, cidade, pais } = body;
  const errors = {};

  // Helper: accept numeric strings too (coerce later)
  const isNumeric = (v) =>
    v !== undefined && v !== null && !Number.isNaN(Number(v));

  if (req.method === "POST") {
    if (!isNumeric(latitude)) {
      errors.latitude = ["Latitude is mandatory and must be a number."];
    }
    if (!isNumeric(longitude)) {
      errors.longitude = ["Longitude is mandatory and must be a number."];
    }
  } else {
    // PATCH/PUT: only validate when provided
    if (latitude !== undefined && !isNumeric(latitude)) {
      errors.latitude = ["Latitude must be a number."];
    }
    if (longitude !== undefined && !isNumeric(longitude)) {
      errors.longitude = ["Longitude must be a number."];
    }
  }

  if (cidade !== undefined && typeof cidade !== "string") {
    errors.cidade = ["City must be a string."];
  }

  // Require 'pais' when creating a new location (POST)
  if (req.method === "POST") {
    if (!pais || typeof pais !== "string") {
      errors.pais = [
        "Country is mandatory when creating a location and must be a string.",
      ];
    }
  } else if (pais !== undefined && typeof pais !== "string") {
    errors.pais = ["Country must be a string."];
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      description: "Validation failed.",
      errors,
    });
  }

  // Coerce numeric strings to numbers for downstream handlers
  if (isNumeric(latitude)) req.body.latitude = Number(latitude);
  if (isNumeric(longitude)) req.body.longitude = Number(longitude);

  next();
};

/**
 * checkLocationExists(req, res, next)
 * Loads a Location by `userId`. Useful for endpoints that update
 * or get a specific user's location.
 */
export const checkLocationExists = async (req, res, next) => {
  const { userId } = req.params;
  const location = await Location.findOne({
    where: { id_utilizador: Number(userId) },
  });

  if (!location) {
    return res.status(404).json({
      description: "Resource not found.",
      errors: { location: ["Location for this user not found."] },
    });
  }

  req.location = location;
  next();
};
