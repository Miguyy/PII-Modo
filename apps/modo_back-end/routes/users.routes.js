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

const router = express.Router();

router.post("/", validateCreateUser, createUser);
router.post("/login", loginUser);

router.get("/", authenticate, authorizeAdmin, getAllUsers);

router.get("/:userId", authenticate, validateUserId, getUserById);

router.patch("/:userId", authenticate, validateUserId, updateUser);

router.delete(
  "/:userId",
  authenticate,
  authorizeAdmin,
  validateUserId,
  deleteUser,
);

router.post("/:userId/habits", authenticate, validateUserId, assignTaskToUser);

// NOTE: the `/users/:userId/habits` endpoint is mounted under the
// `users` router as `POST /users/:userId/habits` for API consistency.
router.post("/:userId/habits", assignTaskToUser);

export default router;
