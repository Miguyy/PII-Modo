/*
  Purpose: HTTP controllers for User Locations. Manages the 1-to-1
  relationship between a user and their location coordinates.
  Includes protections against Mass Assignment by destructuring req.body.
*/

import { Location } from "../config/db.config.js";

/**
 * getAllLocations(req, res, next)
 * Returns all stored locations across users. Useful for admin views.
 */
export const getAllLocations = async (req, res, next) => {
  try {
    const locations = await Location.findAll();
    const response = locations.map((loc) => ({
      ...loc.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/users/${loc.id_utilizador}/location`,
        },
      ],
    }));
    res.status(200).json(response);
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};

/**
 * getLocation(req, res, next)
 * Returns the location attached to `req.location` by middleware.
 */
export const getLocation = async (req, res, next) => {
  try {
    const location = req.location;

    // Authorization: only admin or the owner can view this location
    const requester = req.user;
    const requesterRole = (
      (requester &&
        (requester.tipo_utilizador || requester.dataValues?.tipo_utilizador)) ||
      ""
    ).toLowerCase();
    const requesterId =
      requester &&
      (requester.id_utilizador || requester.dataValues?.id_utilizador);
    if (
      requesterRole !== "admin" &&
      Number(requesterId) !== Number(location.id_utilizador)
    ) {
      return next({ status: 403, message: "Forbidden." });
    }

    res.status(200).json({
      ...location.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/users/${location.id_utilizador}/location`,
        },
      ],
    });
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};

/**
 * createLocation(req, res, next)
 * Creates a location for a user.
 */
export const createLocation = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Only admin or the owner may create a location for the user
    const requester = req.user;
    const requesterRole = (
      (requester &&
        (requester.tipo_utilizador || requester.dataValues?.tipo_utilizador)) ||
      ""
    ).toLowerCase();
    const requesterId =
      requester &&
      (requester.id_utilizador || requester.dataValues?.id_utilizador);
    if (requesterRole !== "admin" && Number(requesterId) !== Number(userId)) {
      return next({ status: 403, message: "Forbidden." });
    }

    // Security Protection: Extract only the allowed fields
    const { latitude, longitude, cidade, pais } = req.body || {};

    // Optional Security Check: Ensure the authenticated user is creating a location for themselves
    /*
    if (req.user && req.user.id !== parseInt(userId)) {
      return next({ status: 403, message: "Forbidden. You can only update your own location." });
    }
    */

    const existing = await Location.findOne({
      where: { id_utilizador: Number(userId) },
    });
    if (existing) {
      return next({
        status: 409,
        message: "Resource conflict.",
        errors: {
          location: [
            "Location already exists for this user. Use PUT/PATCH to update.",
          ],
        },
      });
    }

    const location = await Location.create({
      id_utilizador: Number(userId),
      latitude,
      longitude,
      cidade,
      pais,
    });

    res.status(201).json({
      ...location.toJSON(),
      links: [
        { rel: "self", method: "GET", href: `/users/${userId}/location` },
      ],
    });
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};

/**
 * updateLocation(req, res, next)
 * Updates the user's location instance available at `req.location`.
 */
export const updateLocation = async (req, res, next) => {
  try {
    const location = req.location;

    // Only admin or owner may update location
    const requester = req.user;
    const requesterRole = (
      (requester &&
        (requester.tipo_utilizador || requester.dataValues?.tipo_utilizador)) ||
      ""
    ).toLowerCase();
    const requesterId =
      requester &&
      (requester.id_utilizador || requester.dataValues?.id_utilizador);
    if (
      requesterRole !== "admin" &&
      Number(requesterId) !== Number(location.id_utilizador)
    ) {
      return next({ status: 403, message: "Forbidden." });
    }

    // Security Protection: Extract only the allowed fields for update
    const { latitude, longitude, cidade, pais } = req.body || {};

    const updated = await location.update({
      latitude: latitude === undefined ? location.latitude : latitude,
      longitude: longitude === undefined ? location.longitude : longitude,
      cidade: cidade === undefined ? location.cidade : cidade,
      pais: pais === undefined ? location.pais : pais,
    });

    res.status(200).json({
      ...updated.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/users/${location.id_utilizador}/location`,
        },
      ],
    });
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};

export const deleteLocation = async (req, res, next) => {
  try {
    const location = req.location;
    if (!location) return next({ status: 404, message: "Location not found." });

    // Only admin can delete locations
    const requester = req.user;
    const requesterRole = (
      (requester &&
        (requester.tipo_utilizador || requester.dataValues?.tipo_utilizador)) ||
      ""
    ).toLowerCase();
    if (requesterRole !== "admin") {
      return next({ status: 403, message: "Forbidden." });
    }

    await location.destroy();
    res.status(204).send();
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};
