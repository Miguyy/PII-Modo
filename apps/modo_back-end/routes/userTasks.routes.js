import express from "express";
// Import controllers for users tasks resources
import {
  getAllUserTasks,
  assignTaskToUser,
  deleteUserTask,
  getUserTaskById,
  updateUserTask,
  completeUserTask,
} from "../controllers/userTasks.controllers.js";

const router = express.Router();

router.get("/:userId/habits/:habitId/tasks", getAllUserTasks);
router.post("/:userId/habits/:habitId/tasks", assignTaskToUser);
router.get("/:userId/tasks/:taskId", getUserTaskById);
router.patch("/:userId/tasks/:taskId/progress", updateUserTask);
router.delete("/:userId/habits/:habitId/tasks", deleteUserTask);
router.post("/:userId/tasks/:taskId/complete", completeUserTask);

export default router;
