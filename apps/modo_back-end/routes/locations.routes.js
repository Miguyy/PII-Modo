import express from "express";
// Import controllers for locations resources
import {
  createLocation,
  getUserLocation,
  updateLocation,
} from "../controllers/locations.controllers.js";

// - Use mergeParams: true to access parameters from the parent router (e.g., :userId)
// - if this router is nested within another.
const router = express.Router({ mergeParams: true });

// Route to create a new location for a specific user
router.post("/", createLocation);

// Route to get all locations (or current) for a specific user
router.get("/", getUserLocation);

// Route to update a specific location for a user
router.patch("/:locationId", updateLocation);

export default router;
