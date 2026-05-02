import express from "express";
import {
  createDecoration,
  getDecorations,
  updateDecoration,
  deleteDecoration
} from "../controllers/decorations.controllers.js";

const router = express.Router();

// Route to get all available decorations
router.get("/", getDecorations);

// Route to create a new decoration
router.post("/", createDecoration);

// Route to update a specific decoration
router.patch("/:id", updateDecoration);

// Route to delete a decoration
router.delete("/:id", deleteDecoration);

export default router;