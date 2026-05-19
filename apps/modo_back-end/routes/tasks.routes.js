/*
  Purpose: Express router that defines Task-related endpoints. Routes
  include listing, creation, retrieval, update and deletion of Tasks.
  Authentication, authorization and validation middleware are applied
  where appropriate and controllers handle the business logic.
*/

import express from "express";

// Import middlewares for users resources
import {
  authenticateUser,
  authorizeAdmin,
} from "../middlewares/users.middlewares.js";

// Import middlewares for tasks resources
import {
  validateCreateTask,
  validateTaskId,
  checkTaskExists,
} from "../middlewares/tasks.middlewares.js";

// Import controllers for tasks resources
import {
  getAllTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/tasks.controllers.js";

// Import controllers for impacts resources to handle the `/tasks/:taskId/impacts` endpoint
import { getTaskImpacts } from "../controllers/impacts.controllers.js";

const router = express.Router();

/**
 * GET /
 * Purpose: Return a list of tasks. No authentication required.
 * Handler: `getAllTasks`
 */
router.get("/", getAllTasks);

/**
 * POST /
 * Purpose: Create a new task. Requires admin authentication and
 * validates payload via `validateCreateTask`.
 * Handler: `createTask`
 */
router.post(
  "/",
  authenticateUser,
  authorizeAdmin,
  validateCreateTask,
  createTask,
);

/**
 * GET /:taskId
 * Purpose: Retrieve a specific task. Requires authentication and
 * validates `taskId` and existence via `checkTaskExists`.
 * Handler: `getTaskById`
 */
router.get(
  "/:taskId",
  authenticateUser,
  validateTaskId,
  checkTaskExists,
  getTaskById,
);

/**
 * GET /:taskId/impacts
 * Purpose: List impacts associated with a given task. Mounted here
 * for API convenience. Requires authentication and task validation.
 * Handler: `getTaskImpacts`
 */
// NOTE: the `/tasks/:taskId/impacts` endpoint is mounted under the
// `impacts` router as `GET /tasks/:taskId/impacts` for API consistency.
router.get(
  "/:taskId/impacts",
  authenticateUser,
  validateTaskId,
  checkTaskExists,
  getTaskImpacts,
);

/**
 * PATCH /:taskId
 * Purpose: Update a task. Requires admin auth and validates id/existence.
 * Handler: `updateTask`
 */
router.patch(
  "/:taskId",
  authenticateUser,
  authorizeAdmin,
  validateTaskId,
  checkTaskExists,
  updateTask,
);

/**
 * DELETE /:taskId
 * Purpose: Delete a task. Requires admin auth and task existence check.
 * Handler: `deleteTask`
 */
router.delete(
  "/:taskId",
  authenticateUser,
  authorizeAdmin,
  validateTaskId,
  checkTaskExists,
  deleteTask,
);

export default router;
