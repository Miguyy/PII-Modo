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
  const { latitude, longitude, cidade } = req.body;
  const errors = {};

  if (latitude === undefined || typeof latitude !== "number") {
    errors.latitude = ["Latitude is mandatory and must be a number."];
  }

  if (longitude === undefined || typeof longitude !== "number") {
    errors.longitude = ["Longitude is mandatory and must be a number."];
  }

  if (cidade && typeof cidade !== "string") {
    errors.cidade = ["City must be a string."];
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
 * checkLocationExists(req, res, next)
 * Loads a Location by `userId`. Useful for endpoints that update
 * or get a specific user's location.
 */
export const checkLocationExists = async (req, res, next) => {
  const { userId } = req.params;
  const location = await Location.findOne({ where: { userId } });

  if (!location) {
    return res.status(404).json({
      description: "Resource not found.",
      errors: { location: ["Location for this user not found."] },
    });
  }

  req.location = location;
  next();
};