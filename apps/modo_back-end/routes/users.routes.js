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
  authenticateOptional,
  authorizeAdmin,
  authorizeOwnerOrAdmin,
} from "../middlewares/users.middlewares.js";
import { uploadReport } from "../utils/upload.utils.js";

// Import controllers for users resources
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
  forgotPassword,
  resetPassword,
  logout,
} from "../controllers/users.controllers.js";

// Use the userTasks controller to batch-assign habit tasks to a user
import { assignHabitTasksToUser } from "../controllers/userTasks.controllers.js";

/* import { verifyToken, requireAdmin } from "../utils/auth.utils.js"; */

const router = express.Router();

/**
 * POST /
 * Purpose: Register a new user. Validates payload via
 * `validateCreateUser` then calls `createUser`.
 */
// Public registration: clients may self-register. If a Bearer token is
// present it will be validated (optional auth) so admins can create
// users with elevated roles.
router.post(
  "/",
  authenticateOptional,
  validateCreateUser,
  uploadReport.single("imagem_utilizador"),
  createUser,
);

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
router.patch(
  "/:userId",
  authenticateUser,
  authorizeOwnerOrAdmin,
  validateUserId,
  uploadReport.single("imagem_utilizador"),
  updateUser,
);

/**
 * DELETE /:userId
 * Purpose: Delete a user. Requires admin auth and validates id.
 */
router.delete(
  "/:userId",
  authenticateUser,
  validateUserId,
  authorizeOwnerOrAdmin,
  deleteUser,
);

// Password reset flow
router.post("/forgot-password", forgotPassword);
// Reset in one step: token may be in params or body
router.post("/forgot-password/:token", resetPassword);
router.post("/reset-password", resetPassword);

// Logout (stateless JWT) - client should discard token
router.post("/logout", authenticateUser, logout);

/**
 * POST /:userId/habits
 * Purpose: Assign a habit to a user. Requires authentication and
 * validates `userId`.
 */
router.post(
  "/:userId/habits",
  authenticateUser,
  validateUserId,
  assignHabitTasksToUser,
);

export default router;
