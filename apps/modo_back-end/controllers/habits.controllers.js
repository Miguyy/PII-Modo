/*
  Purpose: HTTP controller handlers for the Habit resource.
  Exports functions used by routes to list, create, read, update and
  delete habit records. Each controller responds with HATEOAS links
  and calls `next()` with an error object on failure.
*/

// Import habits data
import { Habit } from "../config/db.config.js";
import { Op } from "sequelize";
import {
  validationError,
  notFoundError,
  conflictError,
  genericError,
} from "../utils/errors.utils.js";

/**
 * getAllHabits(req, res, next)
 * Retrieves all habits from the database and returns them as JSON.
 * Query parameters for filtering/sorting/pagination are accepted but
 * not implemented yet. Adds a HATEOAS `self` link to each habit.
 * On error, forwards a 500 error via `next()`.
 */
// Controller to get all habits
export const getAllHabits = async (req, res, next) => {
  const {
    q,
    sort = "id_habito",
    order = "ASC",
    page = 1,
    limit = 5,
  } = req.query;
  try {
    const parsedPage = Math.max(Number(page) || 1, 1);
    const parsedLimit = Math.min(Math.max(Number(limit) || 5, 1), 100);
    const offset = (parsedPage - 1) * parsedLimit;

    const safeSortFields = new Set(["id_habito", "nome_habito", "categoria"]);
    const sortField = safeSortFields.has(sort) ? sort : "id_habito";
    const sortOrder = String(order).toUpperCase() === "DESC" ? "DESC" : "ASC";

    const where = {};
    if (q) {
      where[Op.or] = [
        { nome_habito: { [Op.like]: `%${q}%` } },
        { categoria: { [Op.like]: `%${q}%` } },
      ];
    }

    const { rows, count } = await Habit.findAndCountAll({
      where,
      order: [[sortField, sortOrder]],
      limit: parsedLimit,
      offset,
    });

    const response = rows.map((habit) => ({
      ...habit.toJSON(),
      links: [
        { rel: "self", method: "GET", href: `/habits/${habit.id_habito}` },
      ],
    }));

    res
      .status(200)
      .json({
        meta: {
          total: count,
          page: parsedPage,
          limit: parsedLimit,
          pages: Math.ceil(count / parsedLimit),
        },
        data: response,
      });
  } catch (error) {
    return next(genericError());
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
    if (error.name === "SequelizeValidationError") {
      return next(validationError({ nome: ["Name is mandatory."] }));
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      return next(
        conflictError({ nome: ["A habit with this name already exists."] }),
      );
    }
    return next(genericError());
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
      return next(notFoundError("Habit", habitId));
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
    return next(genericError());
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
      return next(notFoundError("Habit", habitId));
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
    if (error.name === "SequelizeUniqueConstraintError") {
      return next(
        conflictError({ nome: ["A habit with this name already exists."] }),
      );
    }
    return next(genericError());
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
      return next(notFoundError("Habit", habitId));
    }
    await habit.destroy();
    res.status(204).send();
  } catch (error) {
    return next(genericError());
  }
};
