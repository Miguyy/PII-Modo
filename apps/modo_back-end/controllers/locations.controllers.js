/*
  Purpose: HTTP controllers for User Locations. Manages the 1-to-1
  relationship between a user and their location coordinates.
  Includes protections against Mass Assignment by destructuring req.body.
*/

import { Location } from "../config/db.config.js";

/**
 * getLocation(req, res, next)
 * Returns the location attached to `req.location` by middleware.
 */
export const getLocation = async (req, res, next) => {
  try {
    const location = req.location;

    res.status(200).json({
      ...location.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/users/${location.userId}/location`,
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

    // Security Protection: Extract only the allowed fields
    const { latitude, longitude, cidade } = req.body;

    // Optional Security Check: Ensure the authenticated user is creating a location for themselves
    /*
    if (req.user && req.user.id !== parseInt(userId)) {
      return next({ status: 403, message: "Forbidden. You can only update your own location." });
    }
    */

    const existing = await Location.findOne({ where: { userId } });
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
      userId,
      latitude,
      longitude,
      cidade,
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

    // Security Protection: Extract only the allowed fields for update
    const { latitude, longitude, cidade } = req.body;

    const updated = await location.update({
      latitude: latitude ?? location.latitude,
      longitude: longitude ?? location.longitude,
      cidade: cidade ?? location.cidade,
    });

    res.status(200).json({
      ...updated.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/users/${location.userId}/location`,
        },
      ],
    });
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};

/**
 * deleteLocation(req, res, next)
 * Deletes the location attached to `req.location`.
 */
/* export const deleteLocation = async (req, res, next) => {
  try {
    const location = req.location;
    await location.destroy();
    res.status(204).send();
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};
 */
