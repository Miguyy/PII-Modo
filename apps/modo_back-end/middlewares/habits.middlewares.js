import { Habit } from "../config/db.config.js";

export const validateCreateHabit = (req, res, next) => {
  const { nome, descricao_habito, categoria } = req.body;
  const errors = {};

  if (!nome || typeof nome !== "string" || nome.trim() === "") {
    errors.nome = ["Name is mandatory."];
  }

  if (descricao_habito && typeof descricao_habito !== "string") {
    errors.descricao_habito = ["Invalid description value."];
  }

  if (categoria && typeof categoria !== "string") {
    errors.categoria = ["Invalid category value."];
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      description: "Validation failed.",
      errors,
    });
  }
  next();
};

export const validateHabitId = async (req, res, next) => {
  const { habitId } = req.params;

  if (!habitId || isNaN(parseInt(habitId) || parseInt(habitId) <= 0)) {
    return res.status(400).json({
      description: "Validation failed.",
      errors: { habitId: ["Invalid habit ID format."] },
    });
  }
  next();
};

export const checkHabitExists = async (req, res, next) => {
  const { habitId } = req.params;
  const habit = await Habit.findByPk(habitId);

  if (!habit) {
    return res.status(404).json({
      description: "Resource not found.",
      errors: { habitId: ["Habit with the specified ID does not exist."] },
    });
  }

  req.habit = habit; // Attach the habit to the request object for use in controllers

  next();
};
