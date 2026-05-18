// Import locations data
import { Location, User } from "../config/db.config.js";

// Controller to create a new location
export const createLocation = async (req, res, next) => {
  try {
    // id_utilizador, pais, and cidade are now extracted from the request body
    const { id_utilizador, pais, cidade, latitude, longitude } = req.body;

    if (!id_utilizador) {
      const err = new Error("User ID (id_utilizador) is required in the request body.");
      err.status = 400;
      return next(err);
    }

    // Check if the user exists
    const user = await User.findByPk(id_utilizador);
    if (!user) {
      const err = new Error("User not found.");
      err.status = 404;
      return next(err);
    }

    // Create the location associated with the user
    const location = await Location.create({
      id_utilizador, // Foreign key that associates the location with the user
      pais,
      cidade,
      latitude,
      longitude,
      userId // Foreign key that associates the location with the user
    });

    // Include HATEOAS links in the response (updated to /locations base path)
    const response = {
      ...location.toJSON(),
      links: {
        self: `/locations/${location.id}`,
        user: `/users/${id_utilizador}`,
        user: `/users/${userId}`
      },
    };
    
    res.status(201).json(response);
  } catch (error) {
    // Handle specific errors
    if (error.name === "SequelizeValidationError") {
      const err = new Error("Validation error.");
      err.status = 400;
      err.errors = error.errors.map((e) => e.message);
      return next(err);
    }
    if (error.name === "UnauthorizedError") {
      const err = new Error("Missing or invalid authentication token.");
      err.status = 401;
      return next(err);
    }
    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};

// Controller to get locations (filtered by user if id_utilizador is passed in query)
// GET /locations?id_utilizador={id}
export const getUserLocation = async (req, res, next) => {
// Controller to get locations (filtered by user if userId is passed in query)
// GET /locations?userId={id}
export const getLocations = async (req, res, next) => {
  try {
    // id_utilizador is now extracted from the query parameters
    const { id_utilizador } = req.query;

    let whereClause = {};

    // If a id_utilizador is provided, validate the user and filter locations
    if (id_utilizador) {
      const user = await User.findByPk(id_utilizador);
      if (!user) {
        const err = new Error("User not found.");
        err.status = 404;
        return next(err);
      }
      whereClause.id_utilizador = id_utilizador;
    }

    // Fetch the locations
    const locations = await Location.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']] // Brings the most recent location first
    });

    // Include HATEOAS links in the response
    const response = locations.map((loc) => ({
      ...loc.toJSON(),
      links: {
        self: `/locations/${loc.id}`,
        user: `/users/${loc.userId}`
      },
    }));

    res.status(200).json(response);
  } catch (error) {
    if (error.name === "UnauthorizedError") {
      const err = new Error("Missing or invalid authentication token.");
      err.status = 401;
      return next(err);
    }
    if (error.name === "ForbiddenError") {
      const err = new Error("You do not have permission to access this resource.");
      err.status = 403;
      return next(err);
    }
    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};

// Controller to update a location
// PATCH /locations/:locationId
export const updateLocation = async (req, res, next) => {
  try {
    // locationId is extracted from the URL parameters
    const { locationId } = req.params; 
    // Fields to be updated are extracted from the body
    const { pais, cidade, latitude, longitude } = req.body;

    // Find the location directly by its ID
    const location = await Location.findByPk(locationId);

    if (!location) {
      const err = new Error("Location not found.");
      err.status = 404;
      return next(err);
    }

    // Update only the fields sent in the body (PATCH behavior)
    if (pais) location.pais = pais;
    if (cidade) location.cidade = cidade;
    if (latitude !== undefined) location.latitude = latitude;
    if (longitude !== undefined) location.longitude = longitude;

    await location.save();

    // Include HATEOAS links in the response
    const response = {
      ...location.toJSON(),
      links: {
        self: `/locations/${location.id}`,
        user: `/users/${location.userId}`
      },
    };

    res.status(200).json(response);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const err = new Error("Validation error.");
      err.status = 400;
      err.errors = error.errors.map((e) => e.message);
      return next(err);
    }
    if (error.name === "UnauthorizedError") {
      const err = new Error("Missing or invalid authentication token.");
      err.status = 401;
      return next(err);
    }
    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};