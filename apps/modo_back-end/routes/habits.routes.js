import express from "express";

// Import middlewares for habits resources
import {
  validateCreateHabit,
  validateHabitId,
  checkHabitExists,
} from "../middlewares/habits.middlewares.js";

// Import middlewares for users resources
import {
  authenticateUser,
  authorizeAdmin,
} from "../middlewares/users.middlewares.js";

// Import controllers for habits resources
import {
  getAllHabits,
  createHabit,
  getHabitById,
  updateHabit,
  deleteHabit,
} from "../controllers/habits.controllers.js";

const router = express.Router();

router.get("/", getAllHabits);

router.post(
  "/",
  authenticateUser,
  authorizeAdmin,
  validateCreateHabit,
  createHabit,
);

router.get("/:habitId", validateHabitId, checkHabitExists, getHabitById);

router.patch(
  "/:habitId",
  authenticateUser,
  authorizeAdmin,
  validateHabitId,
  checkHabitExists,
  validateCreateHabit,
  updateHabit,
);

router.delete(
  "/:habitId",
  authenticateUser,
  authorizeAdmin,
  validateHabitId,
  checkHabitExists,
  deleteHabit,
);

export default router;
