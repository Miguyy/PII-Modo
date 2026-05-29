/*
  Purpose: HTTP controller handlers for the Habit resource.
  Exports functions used by routes to list, create, read, update and
  delete habit records. Each controller responds with HATEOAS links
  and calls `next()` with an error object on failure.
*/

// Import habits data
import { Habit } from "../config/db.config.js";

/**
 * getAllHabits(req, res, next)
 * Retrieves all habits from the database and returns them as JSON.
 * Query parameters for filtering/sorting/pagination are accepted but
 * not implemented yet. Adds a HATEOAS `self` link to each habit.
 * On error, forwards a 500 error via `next()`.
 */
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
      links: [
        { rel: "self", method: "GET", href: `/habits/${habit.id_habito}` },
      ],
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

/**
 * createHabit(req, res, next)
 * Creates a new Habit using `nome`, `descricao_habito`, and `categoria`
 * from the request body. Returns the created habit (HTTP 201) with a
 * HATEOAS `self` link. On validation or unique constraint errors,
 * forwards 400/409 respectively via `next()`, otherwise 500.
 */
// Controller to create a new habit
export const createHabit = async (req, res, next) => {
  try {
    const { descricao_habito, categoria } = req.body;
    const name = req.body.nome ?? req.body.nome_habito;
    // Validate required fields and create the habit using model column names
    const habit = await Habit.create({
      nome_habito: name,
      descricao_habito,
      categoria,
    });

    // Include HATEOAS links in the response
    const response = {
      ...habit.toJSON(),
      links: [
        { rel: "self", method: "GET", href: `/habits/${habit.id_habito}` },
      ],
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

/**
 * getHabitById(req, res, next)
 * Returns the habit attached to `req.habit` by middleware. If the
 * habit is missing, forwards a 404 error. Adds a HATEOAS `self` link
 * to the returned object.
 */
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
      links: [
        { rel: "self", method: "GET", href: `/habits/${habit.id_habito}` },
      ],
    };

    res.status(200).json(response);
  } catch (error) {
    // Handle specific errors: 500
    return next({ status: 500, message: "Internal server error." });
  }
};

/**
 * updateHabit(req, res, next)
 * Updates fields of the habit instance available at `req.habit` using
 * values from the request body. Handles unique constraint errors and
 * returns the updated habit with a `self` link on success.
 */
// Controller to update a habit
export const updateHabit = async (req, res, next) => {
  try {
    const { habitId } = req.params;
    const name = req.body.nome ?? req.body.nome_habito;
    const { descricao_habito, categoria } = req.body;
    const habit = req.habit;

    if (!habit) {
      return next({ status: 404, message: "Habit not found." });
    }

    // Support partial updates for nome_habito, descricao_habito and categoria
    await habit.update({
      nome_habito: name ?? habit.nome_habito,
      descricao_habito: descricao_habito ?? habit.descricao_habito,
      categoria: categoria ?? habit.categoria,
    });

    // Include HATEOAS links in the response
    const response = {
      ...habit.toJSON(),
      links: [
        { rel: "self", method: "GET", href: `/habits/${habit.id_habito}` },
      ],
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

/**
 * deleteHabit(req, res, next)
 * Deletes the habit instance attached to `req.habit`. If not found,
 * forwards a 404. On success responds with HTTP 204 No Content.
 */
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
