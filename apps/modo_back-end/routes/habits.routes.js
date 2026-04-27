import express from "express";
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
router.post("/", createHabit);
router.get("/:habitId", getHabitById);
router.patch("/:habitId", updateHabit);
router.delete("/:habitId", deleteHabit);

export default router;
