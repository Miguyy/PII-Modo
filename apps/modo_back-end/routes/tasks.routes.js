import express from "express";
// Import controllers for tasks resources
import {
  getAllTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/tasks.controllers.js";

import { getTaskImpacts } from "../controllers/impacts.controllers.js";

const router = express.Router();

router.get("/", getAllTasks);
router.post("/", createTask);
router.get("/:taskId", getTaskById);

// NOTE: the `/tasks/:taskId/impacts` endpoint is mounted under the
// `impacts` router as `GET /tasks/:taskId/impacts` for API consistency.
router.get("/:taskId/impacts", getTaskImpacts);

router.patch("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);

export default router;
