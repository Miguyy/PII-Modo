import express from "express";
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

router.post("/", createUser);
router.post("/login", loginUser);
router.get("/", getAllUsers);
router.get("/:userId", getUserById);
router.patch("/:userId", updateUser);
router.delete("/:userId", deleteUser);

// NOTE: the `/users/:userId/habits` endpoint is mounted under the
// `users` router as `POST /users/:userId/habits` for API consistency.
router.post("/:userId/habits", assignTaskToUser);

export default router;
