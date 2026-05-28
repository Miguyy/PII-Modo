/*Purpose: This file defines the routes for managing decorations in the application. It includes routes for creating, retrieving, updating, and deleting decorations. 
Each route is associated with a specific controller function that handles the corresponding operation.*/

import express from "express";
import {
  authenticateUser,
  authorizeAdmin,
} from "../middlewares/users.middlewares.js";
import {
  createDecoration,
  getAllDecorations,
  updateDecoration,
  deleteDecoration,
} from "../controllers/decorations.controllers.js";

const router = express.Router();

// Route to get all available decorations (requires auth for admin and clients)
router.get("/", authenticateUser, getAllDecorations);

// Route to create a new decoration (admin only)
router.post("/", authenticateUser, authorizeAdmin, createDecoration);

// Route to update a specific decoration (admin only)
router.patch("/:id", authenticateUser, authorizeAdmin, updateDecoration);

// Route to delete a decoration (admin only)
router.delete("/:id", authenticateUser, authorizeAdmin, deleteDecoration);

export default router;
