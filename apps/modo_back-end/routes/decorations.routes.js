/*Purpose: This file defines the routes for managing decorations in the application. It includes routes for creating, retrieving, updating, and deleting decorations. 
Each route is associated with a specific controller function that handles the corresponding operation.*/

import express from "express";
import {
  createDecoration,
  getAllDecorations,
  updateDecoration,
  deleteDecoration,
} from "../controllers/decorations.controllers.js";

const router = express.Router();

// Route to get all available decorations
router.get("/", getAllDecorations);

// Route to create a new decoration
router.post("/", createDecoration);

// Route to update a specific decoration
router.patch("/:id", updateDecoration);

// Route to delete a decoration
router.delete("/:id", deleteDecoration);

export default router;
