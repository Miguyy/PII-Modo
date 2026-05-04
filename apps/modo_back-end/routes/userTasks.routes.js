import express from "express";

// Import middlewares for users tasks resources
import {
  validateUserTaskIds,
  checkUserTaskExists,
} from "../middlewares/userTasks.middlewares.js";

// Import middlewares for users resources
import { authenticateUser } from "../middlewares/users.middlewares.js";

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

router.get(
  "/:userId/habits/:habitId/tasks",
  authenticateUser,
  validateUserTaskIds,
  getAllUserTasks,
);

router.post(
  "/:userId/habits/:habitId/tasks",
  authenticateUser,
  validateUserTaskIds,
  assignTaskToUser,
);

router.get(
  "/:userId/tasks/:taskId",
  authenticateUser,
  validateUserTaskIds,
  checkUserTaskExists,
  getUserTaskById,
);

router.patch(
  "/:userId/tasks/:taskId/progress",
  authenticateUser,
  validateUserTaskIds,
  checkUserTaskExists,
  updateUserTask,
);

router.delete(
  "/:userId/habits/:habitId/tasks",
  authenticateUser,
  validateUserTaskIds,
  deleteUserTask,
);

router.post(
  "/:userId/tasks/:taskId/complete",
  authenticateUser,
  validateUserTaskIds,
  checkUserTaskExists,
  completeUserTask,
);

export default router;
