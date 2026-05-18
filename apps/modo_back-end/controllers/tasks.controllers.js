/*
  Purpose: HTTP controller handlers for the Task resource.
  Exports functions used by routes to list, create, read, update and
  delete tasks. Responses include HATEOAS `self` links and errors are
  forwarded to `next()` with appropriate status objects.
*/
// Import tasks data
import { Task } from "../config/db.config.js";

/**
 * getAllTasks(req, res, next)
 * Retrieves tasks from the database and returns them as JSON. Query
 * parameters for filtering and pagination are accepted but not yet
 * implemented. Adds HATEOAS `self` links to each task.
 */
// Controller to get all tasks
export const getAllTasks = async (req, res, next) => {
  const {
    tipo_tarefa,
    localizacao_tarefa,
    prioridade_tarefa,
    sort, // TODO: Implement sorting and filtering
    page = 1, // after we have sequelize and DB implemented
    limit = 10,
  } = req.query;

  try {
    const tasks = await Task.findAll();

    // Include HATEOAS links in the response
    const response = tasks.map((task) => ({
      ...task.toJSON(),
      links: [{ rel: "self", method: "GET", href: `/tasks/${task.id}` }],
    }));

    res.status(200).json(response);
  } catch (error) {
    // Handle specific errors: 500
    return next({ status: 500, message: "Internal server error." });
  }
};

/**
 * createTask(req, res, next)
 * Creates a Task using fields from the request body. Returns HTTP 201
 * with the created resource and a `self` HATEOAS link. Validation and
 * unique constraint errors are forwarded with 400/409 codes.
 */
// Controller to create a new task
export const createTask = async (req, res, next) => {
  try {
    const { nome, tipo_tarefa, localizacao_tarefa, prioridade_tarefa } =
      req.body;

    const task = await Task.create({
      nome,
      tipo_tarefa,
      localizacao_tarefa,
      prioridade_tarefa,
    });

    // Include HATEOAS links in the response
    res.status(201).json({
      ...task.toJSON(),
      links: [{ rel: "self", method: "GET", href: `/tasks/${task.id}` }],
    });
  } catch (error) {
    // Handle specific errors: 400, 409 and 500
    if (error.name === "SequelizeValidationError") {
      return next({
        status: 400,
        message: "Validation failed.",
        errors: { nome: ["Name is mandatory."] },
      });
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      return next({
        status: 409,
        message: "Resource conflict.",
        errors: { nome: ["A task with this name already exists."] },
      });
    }

    return next({ status: 500, message: "Internal server error." });
  }
};

/**
 * getTaskById(req, res, next)
 * Returns the task attached to `req.task` by middleware. Adds a
 * HATEOAS `self` link to the response. Forwards 500 on internal
 * failures.
 */
// Controller to get a task by ID
export const getTaskById = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = req.task;

    // Include HATEOAS links in the response
    const response = {
      ...task.toJSON(),
      links: [{ rel: "self", method: "GET", href: `/tasks/${task.id}` }],
    };

    res.status(200).json(response);
  } catch (error) {
    // Handle specific errors: 500
    return next({ status: 500, message: "Internal server error." });
  }
};

/**
 * updateTask(req, res, next)
 * Updates the task instance available at `req.task` using the request
 * body. Returns the updated resource with a `self` link. Handles
 * unique constraint conflicts and internal errors.
 */
// Controller to update a task
export const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = req.task;

    const updated = await task.update(req.body);

    // Include HATEOAS links in the response
    const response = {
      ...updated.toJSON(),
      links: [{ rel: "self", method: "GET", href: `/tasks/${task.id}` }],
    };

    res.status(200).json(response);
  } catch (error) {
    // Handle specific errors: 409 and 500
    if (error.name === "SequelizeUniqueConstraintError") {
      return next({
        status: 409,
        message: "Resource conflict.",
        errors: { nome: ["A task with this name already exists."] },
      });
    }

    return next({ status: 500, message: "Internal server error." });
  }
};

/**
 * deleteTask(req, res, next)
 * Deletes the task instance attached to `req.task` and returns HTTP
 * 204 on success. Forwards internal errors to `next()`.
 */
// Controller to delete a task
export const deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = req.task;

    await task.destroy();

    res.status(204).send();
  } catch (error) {
    // Handle specific errors: 500
    return next({ status: 500, message: "Internal server error." });
  }
};
