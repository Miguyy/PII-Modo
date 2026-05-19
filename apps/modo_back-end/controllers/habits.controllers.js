// Import habits data
import { Habit } from "../config/db.config.js";

// Controller to get all habits
export const getAllHabits = async (req, res, next) => {
  // Extract query parameters for filtering, sorting, and pagination
  const { nome, sort, page = 1, limit = 10 } = req.query;
  try {
    const habits = await Habit.findAll();
    console.log(`Found ${habits.length} habits in the database.`);

    // Include HATEOAS links in the response
    const response = habits.map((habit) => ({
      ...habit.toJSON(),
      links: {
        self: `/habits/${habit.id}`,
      },
    }));
    res.status(200).json(response);
  } catch (error) {
    // Handle specific errors: 400, 401 and 500

    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};

// Controller to create a new habit
export const createHabit = async (req, res, next) => {
  try {
    const { nome } = req.body;
    // Validate required fields and create the habit
    const habit = await Habit.create({ nome });

    // Include HATEOAS links in the response
    const response = {
      ...habit.toJSON(),
      links: {
        self: `/habits/${habit.id}`,
      },
    };
    res.status(201).json(response);
  } catch (error) {
    // Handle specific errors: 400, 401, 403, 409 and 500
    if (error.name === "SequelizeValidationError") {
      const err = new Error("Validation error.");
      err.status = 400;
      err.errors = error.errors.map((e) => {
        if (e.path === "nome") {
          return "Name is mandatory.";
        }
        return e.message;
      });
      return next(err);
    }
    if (error.name === "UnauthorizedError") {
      const err = new Error("Missing or invalid authentication token.");
      err.status = 401;
      return next(err);
    }
    if (error.name === "ForbiddenError") {
      const err = new Error("You do not have permission to create habits.");
      err.status = 403;
      return next(err);
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      const err = new Error("A habit with this name already exists.");
      err.status = 409;
      return next(err);
    }
    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};

// Controller to get a habit by ID
export const getHabitById = async (req, res, next) => {
  try {
    const { habitId, userId } = req.params;
    const habit = await Habit.findByPk(habitId);
    const user = await User.findByPk(userId);
    if (!user) {
      const err = new Error("User not found.");
      err.status = 404;
      return next(err);
    }
    if (!habit) {
      const err = new Error("Resource not found.");
      err.status = 404;
      return next(err);
    }
    // Include HATEOAS links in the response
    const response = {
      ...habit.toJSON(),
      links: {
        self: `/users/${userId}/habits/${habit.id}`,
        user_habits: `/users/${userId}/habits/${habit.id}/habits`,
      },
    };
    res.status(200).json(response);
  } catch (error) {
    // Handle specific errors: 400, 401, 403, 404 and 500
    if (error.name === "BadRequestError") {
      const err = new Error("Invalid request.");
      err.status = 400;
      error.errors.map((e) => {
        if (e.path === "habitId") {
          return "Invalid habit ID.";
        }
        if (e.path === "userId") {
          return "Invalid user ID.";
        }
        return e.message;
      });
      err.errors = errors;
      return next(err);
    }
    if (error.name === "UnauthorizedError") {
      const err = new Error("Missing or invalid authentication token.");
      err.status = 401;
      return next(err);
    }
    if (error.name === "ForbiddenError") {
      const err = new Error(
        "You do not have permission to access this resource.",
      );
      err.status = 403;
      return next(err);
    }
    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};

// Controller to update a habit
export const updateHabit = async (req, res, next) => {
  try {
    const { habitId } = req.params;
    const { nome, descricao_habito, categoria } = req.body;
    const habit = await Habit.findByPk(habitId);
    if (!habit) {
      const err = new Error("Resource not found.");
      err.status = 404;
      return next(err);
    }
    habit.nome = nome || habit.nome;
    await habit.save();
    // Include HATEOAS links in the response
    const response = {
      ...habit.toJSON(),
      links: {
        self: `/habits/${habit.id}`,
      },
    };
    res.status(200).json(response);
  } catch (error) {
    // Handle specific errors: 400, 401, 403, 404, 409 and 500
    if (error.name === "SequelizeValidationError") {
      const err = new Error("Validation error.");
      err.status = 400;
      err.errors = error.errors.map((e) => {
        if (e.path === "categoria") {
          return "Invalid category value.";
        }
        return e.message;
      });
      return next(err);
    }
    if (error.name === "UnauthorizedError") {
      const err = new Error("Missing or invalid authentication token.");
      err.status = 401;
      return next(err);
    }
    if (error.name === "ForbiddenError") {
      const err = new Error("You do not have permission to update habits.");
      err.status = 403;
      return next(err);
    }
    if (error.name === "NotFoundError") {
      const err = new Error("Habit not found.");
      err.status = 404;
      error.errors.map((e) => {
        if (e.path === "habitId") {
          return "Habit not found.";
        }
        return e.message;
      });
      err.errors = errors;
      return next(err);
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      const err = new Error("A habit with this name already exists.");
      err.status = 409;
      error.errors.map((e) => {
        if (e.path === "nome") {
          return "A habit with this name already exists.";
        }
        return e.message;
      });
      err.errors = errors;
      return next(err);
    }
    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};

// Controller to delete a habit
export const deleteHabit = async (req, res, next) => {
  try {
    const { habitId } = req.params;
    const habit = await Habit.findByPk(habitId);
    if (!habit) {
      const err = new Error("Resource not found.");
      err.status = 404;
      error.errors.map((e) => {
        if (e.path === "habitId") {
          return "Habit not found.";
        }
        return e.message;
      });
      err.errors = errors;
      return next(err);
    }
    await habit.destroy();
    res.status(204).send();
  } catch (error) {
    // Handle specific errors: 400, 401, 403, 404 and 500
    if (error.name === "BadRequestError") {
      const err = new Error("Invalid request.");
      err.status = 400;
      error.errors.map((e) => {
        if (e.path === "habitId") {
          return "Invalid habit ID.";
        }
        return e.message;
      });
      err.errors = errors;
      return next(err);
    }
    if (error.name === "UnauthorizedError") {
      const err = new Error("Missing or invalid authentication token.");
      err.status = 401;
      return next(err);
    }
    if (error.name === "ForbiddenError") {
      const err = new Error("You do not have permission to delete habits.");
      err.status = 403;
      return next(err);
    }
    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};
