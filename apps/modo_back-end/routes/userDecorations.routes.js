/*Purpose: This file defines the routes for managing user decorations in the application. 
It includes routes for unlocking a decoration for a user, retrieving all decorations owned by a user, and activating a specific decoration for the user's avatar. 
Each route is associated with a specific controller function that handles the corresponding operation. 
The routes are designed to be nested under a user-specific path, allowing for operations that are specific to a particular user.*/

import express from "express";
import { authenticateUser } from "../middlewares/users.middlewares.js";
import {
  updateUserDecoration,
  getAllUserDecorations,
  assignDecorationToUser,
} from "../controllers/userDecorations.controllers.js";

const router = express.Router();

// Route to unlock or associate a decoration to the user
// POST /users/:userId/avatar-decorations
router.post(
  "/:userId/avatar-decorations",
  authenticateUser,
  assignDecorationToUser,
);

// Route to list all decorations owned by the user
// GET /users/:userId/avatar-decorations
router.get(
  "/:userId/avatar-decorations",
  authenticateUser,
  getAllUserDecorations,
);

// Route to activate a specific decoration for the avatar
// PATCH /users/:userId/avatar-decorations/:decorationId
router.patch(
  "/:userId/avatar-decorations/:decorationId",
  authenticateUser,
  updateUserDecoration,
);

export default router;
