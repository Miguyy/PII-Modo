import express from "express";
import {
  unlockDecoration,
  getUserDecorations,
  activateDecoration
} from "../controllers/userDecorations.controllers.js";

const router = express.Router();

// Route to unlock or associate a decoration to the user
// POST /users/:userId/avatar-decorations
router.post("/:userId/avatar-decorations", unlockDecoration);

// Route to list all decorations owned by the user
// GET /users/:userId/avatar-decorations
router.get("/:userId/avatar-decorations", getUserDecorations);

// Route to activate a specific decoration for the avatar
// PATCH /users/:userId/avatar-decorations/:decorationId
router.patch("/:userId/avatar-decorations/:decorationId", activateDecoration);

export default router;