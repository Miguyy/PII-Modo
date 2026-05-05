/*
  Purpose: Express router that declares endpoints for the Habit
  resource (list, create, read, update, delete). Routes attach the
  appropriate authentication, authorization and validation middleware
  before delegating to controller handlers.
*/
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

/**
 * GET /
 * Purpose: Return a list of all habits. No authentication required.
 * Handler: `getAllHabits`
 */
router.get("/", getAllHabits);

/**
 * POST /
 * Purpose: Create a new habit. Requires authentication and admin
 * authorization. Validates payload via `validateCreateHabit`.
 * Handler: `createHabit`
 */
router.post(
  "/",
  authenticateUser,
  authorizeAdmin,
  validateCreateHabit,
  createHabit,
);

/**
 * GET /:habitId
 * Purpose: Retrieve a specific habit by id. Validates `habitId` and
 * ensures the habit exists via `checkHabitExists`.
 * Handler: `getHabitById`
 */
router.get("/:habitId", validateHabitId, checkHabitExists, getHabitById);

/**
 * PATCH /:habitId
 * Purpose: Update a habit. Requires admin authentication and validates
 * both the id and payload.
 * Handler: `updateHabit`
 */
router.patch(
  "/:habitId",
  authenticateUser,
  authorizeAdmin,
  validateHabitId,
  checkHabitExists,
  validateCreateHabit,
  updateHabit,
);

/**
 * DELETE /:habitId
 * Purpose: Delete a habit. Requires admin authentication and existence
 * check via `checkHabitExists`.
 * Handler: `deleteHabit`
 */
router.delete(
  "/:habitId",
  authenticateUser,
  authorizeAdmin,
  validateHabitId,
  checkHabitExists,
  deleteHabit,
);

export default router;
