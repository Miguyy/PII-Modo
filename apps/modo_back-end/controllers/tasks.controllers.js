// Import tasks data
import { Task } from "../config/db.config.js";

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
