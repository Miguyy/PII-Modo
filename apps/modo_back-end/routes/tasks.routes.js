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

router.get("/", getAllTasks);

router.post(
  "/",
  authenticateUser,
  authorizeAdmin,
  validateCreateTask,
  createTask,
);

router.get(
  "/:taskId",
  authenticateUser,
  validateTaskId,
  checkTaskExists,
  getTaskById,
);

// NOTE: the `/tasks/:taskId/impacts` endpoint is mounted under the
// `impacts` router as `GET /tasks/:taskId/impacts` for API consistency.
router.get(
  "/:taskId/impacts",
  authenticateUser,
  validateTaskId,
  checkTaskExists,
  getTaskImpacts,
);

router.patch(
  "/:taskId",
  authenticateUser,
  authorizeAdmin,
  validateTaskId,
  checkTaskExists,
  updateTask,
);

router.delete(
  "/:taskId",
  authenticateUser,
  authorizeAdmin,
  validateTaskId,
  checkTaskExists,
  deleteTask,
);

export default router;
