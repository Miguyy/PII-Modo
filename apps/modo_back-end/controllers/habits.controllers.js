// Import habits data
import { Habit } from "../config/db.config.js";

// Controller to get all habits
export const getAllHabits = async (req, res, next) => {
  // Extract query parameters for filtering, sorting, and pagination
  const { nome, sort, page = 1, limit = 10 } = req.query; // TODO: Implement filtering and sorting when the DB/Sequelize are ready

  try {
    const habits = await Habit.findAll();
    console.log(`Found ${habits.length} habits in the database.`);

    // Include HATEOAS links in the response
    const response = habits.map((habit) => ({
      ...habit.toJSON(),
      links: [{ rel: "self", method: "GET", href: `/habits/${habit.id}` }],
    }));
    res.status(200).json(response);
  } catch (error) {
    // Handle specific errors: 500
    return next({
      status: 500,
      message: "Internal server error.",
    });
  }
};

// Controller to create a new habit
export const createHabit = async (req, res, next) => {
  try {
    const { nome, descricao_habito, categoria } = req.body;
    // Validate required fields and create the habit
    const habit = await Habit.create({ nome, descricao_habito, categoria });

    // Include HATEOAS links in the response
    const response = {
      ...habit.toJSON(),
      links: [{ rel: "self", method: "GET", href: `/habits/${habit.id}` }],
    };
    res.status(201).json(response);
  } catch (error) {
    // Handle specific errors: 400, 409 and 500
    if (error.name === "SequelizeValidationError") {
      return next({
        status: 400,
        message: "Validation error.",
        errors: { nome: ["Name is mandatory."] },
      });
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      return next({
        status: 409,
        message: "Resource conflict.",
        errors: { nome: ["A habit with this name already exists."] },
      });
    }
    return next({
      status: 500,
      message: "Internal server error.",
    });
  }
};

// Controller to get a habit by ID
export const getHabitById = async (req, res, next) => {
  try {
    const { habitId } = req.params;

    const habit = req.habit;

    if (!habit) {
      return next({ status: 404, message: "Habit not found." });
    }

    // Include HATEOAS links in the response
    const response = {
      ...habit.toJSON(),
      links: [{ rel: "self", method: "GET", href: `/habits/${habit.id}` }],
    };

    res.status(200).json(response);
  } catch (error) {
    // Handle specific errors: 500
    return next({ status: 500, message: "Internal server error." });
  }
};

// Controller to update a habit
export const updateHabit = async (req, res, next) => {
  try {
    const { habitId } = req.params;
    const { nome } = req.body;
    const habit = req.habit;

    if (!habit) {
      return next({ status: 404, message: "Habit not found." });
    }

    await habit.update({
      nome: nome ?? habit.nome,
    });

    // Include HATEOAS links in the response
    const response = {
      ...habit.toJSON(),
      links: [{ rel: "self", method: "GET", href: `/habits/${habit.id}` }],
    };
    res.status(200).json(response);
  } catch (error) {
    // Handle specific errors: 409 and 500
    if (error.name === "SequelizeUniqueConstraintError") {
      return next({
        status: 409,
        message: "Resource conflict.",
        errors: { nome: ["A habit with this name already exists."] },
      });
    }
    return next({
      status: 500,
      message: "Internal server error.",
    });
  }
};

// Controller to delete a habit
export const deleteHabit = async (req, res, next) => {
  try {
    const { habitId } = req.params;
    const habit = req.habit;

    if (!habit) {
      return next({ status: 404, message: "Habit not found." });
    }
    await habit.destroy();
    res.status(204).send();
  } catch (error) {
    // Handle specific errors: 500
    return next({ status: 500, message: "Internal server error." });
  }
};
