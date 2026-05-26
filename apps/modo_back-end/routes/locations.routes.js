/*Purpose: This file defines the routes for handling location-related operations in the application. It includes routes for creating a new location, retrieving user locations, and updating existing locations. 
The routes are designed to be nested under a user-specific path, allowing for operations that are specific to a particular user.*/

import express from "express";
import {
  createLocation,
  getLocation,
  updateLocation,
} from "../controllers/locations.controllers.js";

// - Use mergeParams: true to access parameters from the parent router (e.g., :userId)
// - if this router is nested within another.
const router = express.Router({ mergeParams: true });

// Route to create a new location for a specific user
router.post("/", createLocation);

// Route to get all locations (or current) for a specific user
router.get("/", getLocation);

// Route to update a specific location for a user
router.patch("/:locationId", updateLocation);

export default router;
