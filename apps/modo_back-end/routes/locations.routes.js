/*Purpose: This file defines the routes for handling location-related operations in the application. It includes routes for creating a new location, retrieving user locations, and updating existing locations. 
The routes are designed to be nested under a user-specific path, allowing for operations that are specific to a particular user.*/

import express from "express";
import {
  createLocation,
  getLocation,
  updateLocation,
} from "../controllers/locations.controllers.js";
import { authenticateUser } from "../middlewares/users.middlewares.js";
import {
  validateLocationPayload,
  checkLocationExists,
} from "../middlewares/locations.middlewares.js";
import { deleteLocation } from "../controllers/locations.controllers.js";

// - Use mergeParams: true to access parameters from the parent router (e.g., :userId)
// - if this router is nested within another.
const router = express.Router({ mergeParams: true });

// Route to create a new location for a specific user (requires auth)
router.post("/", authenticateUser, validateLocationPayload, createLocation);

// Route to get the current location for a specific user (requires auth)
router.get("/", authenticateUser, checkLocationExists, getLocation);

// Route to update the location for a user (requires auth)
// PATCH / updates the user's attached location
router.patch(
  "/",
  authenticateUser,
  checkLocationExists,
  validateLocationPayload,
  updateLocation,
);

// Delete the user's location
router.delete("/", authenticateUser, checkLocationExists, deleteLocation);

export default router;
