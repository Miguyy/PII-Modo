/*
  Purpose: Router for endpoints that manage tasks assigned to users
  (UserTask resource). Defines routes for listing assigned tasks,
  assigning tasks to users, updating progress, completing tasks and
  deleting assignments. Middleware validates parameters and loads
  resources.
*/

import express from "express";

// Import middlewares for users tasks resources
import {
  validateUserTaskIds,
  checkUserTaskExists,
} from "../middlewares/userTasks.middlewares.js";

// Import middlewares for users resources
import { authenticateUser } from "../middlewares/users.middlewares.js";
import uploadReport from "../utils/upload.utils.js";

// Import controllers for users tasks resources
import {
  getAllUserTasks,
  assignTaskToUser,
  assignHabitTasksToUser,
  deleteUserTask,
  getUserTaskById,
  updateUserTask,
  completeUserTask,
} from "../controllers/userTasks.controllers.js";

const router = express.Router();

/**
 * GET /:userId/habits/:habitId/tasks
 * Purpose: List tasks assigned to a user for a given habit.
 * Requires authentication and parameter validation.
 * Handler: `getAllUserTasks`
 */

// Support listing all tasks for a user (no habit filter)
router.get(
  "/:userId/tasks",
  authenticateUser,
  validateUserTaskIds,
  getAllUserTasks,
);

/**
 * POST /:userId/habits/:habitId/tasks
 * Purpose: Assign a task to a user (creates a UserTask). Requires
 * authentication and parameter validation.
 * Handler: `assignTaskToUser`
 */

// Support assigning a task to a user by taskId in the body
router.post(
  "/:userId/tasks",
  authenticateUser,
  validateUserTaskIds,
  assignTaskToUser,
);

// Assign all tasks from a habit to the user
router.post(
  "/:userId/habits",
  authenticateUser,
  validateUserTaskIds,
  assignHabitTasksToUser,
);

/**
 * GET /:userId/tasks/:taskId
 * Purpose: Retrieve a specific UserTask. Requires authentication,
 * validation and existence check.
 * Handler: `getUserTaskById`
 */
router.get(
  "/:userId/tasks/:taskId",
  authenticateUser,
  validateUserTaskIds,
  checkUserTaskExists,
  getUserTaskById,
);

/**
 * PATCH /:userId/tasks/:taskId/progress
 * Purpose: Update progress for an assigned task. Requires auth,
 * validation and existence check.
 * Handler: `updateUserTask`
 */
router.patch(
  "/:userId/tasks/:taskId/progress",
  authenticateUser,
  uploadReport.none(),
  validateUserTaskIds,
  checkUserTaskExists,
  updateUserTask,
);

/**
 * DELETE /:userId/tasks/:taskId
 * Purpose: Remove an assigned task from a user. Requires auth and
 * validation.
 * Handler: `deleteUserTask`
 */
router.delete(
  "/:userId/tasks/:taskId",
  authenticateUser,
  validateUserTaskIds,
  deleteUserTask,
);

/**
 * POST /:userId/tasks/:taskId/complete
 * Purpose: Mark an assigned task as complete. Requires auth,
 * validation and existence check.
 * Handler: `completeUserTask`
 */
router.post(
  "/:userId/tasks/:taskId/complete",
  authenticateUser,
  validateUserTaskIds,
  checkUserTaskExists,
  completeUserTask,
);

export default router;
