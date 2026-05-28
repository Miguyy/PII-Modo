/*
  Purpose: Express router that defines user management endpoints
  including registration, login, listing users, reading/updating/
  deleting a user and assigning habits to a user. Applies validation
  and authentication middleware where appropriate.
*/

import express from "express";

// Import middlewares for users resources
import {
  validateCreateUser,
  validateLoginUser,
  validateUserId,
  authenticateUser,
  authorizeAdmin,
} from "../middlewares/users.middlewares.js";

// Import controllers for users resources
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
  assignTaskToUser,
} from "../controllers/users.controllers.js";

/* import { verifyToken, requireAdmin } from "../utils/auth.utils.js"; */

const router = express.Router();

/**
 * POST /
 * Purpose: Register a new user. Validates payload via
 * `validateCreateUser` then calls `createUser`.
 */
router.post("/", validateCreateUser, createUser);

/**
 * POST /login
 * Purpose: Authenticate a user and return a JWT. Handler: `loginUser`.
 */
router.post("/login", loginUser);

/**
 * GET /
 * Purpose: List users. Requires authentication and admin
 * authorization.
 */
router.get("/", authenticateUser, authorizeAdmin, getAllUsers);

/**
 * GET /:userId
 * Purpose: Retrieve a single user. Requires authentication and
 * validates `userId`.
 */
router.get("/:userId", authenticateUser, validateUserId, getUserById);

/**
 * PATCH /:userId
 * Purpose: Update a user. Requires authentication and validates id.
 */
router.patch("/:userId", authenticateUser, validateUserId, updateUser);

/**
 * DELETE /:userId
 * Purpose: Delete a user. Requires admin auth and validates id.
 */
router.delete(
  "/:userId",
  authenticateUser,
  authorizeAdmin,
  validateUserId,
  deleteUser,
);

/**
 * POST /:userId/habits
 * Purpose: Assign a habit to a user. Requires authentication and
 * validates `userId`.
 */
router.post(
  "/:userId/habits",
  authenticateUser,
  validateUserId,
  assignTaskToUser,
);

export default router;
