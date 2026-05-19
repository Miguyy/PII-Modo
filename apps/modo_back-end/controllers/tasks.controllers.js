// Import tasks data
import { Task } from "../config/db.config.js";

// Controller to get all tasks
export const getAllTasks = async (req, res, next) => {
  const {
    tipo_tarefa,
    localizacao_tarefa,
    prioridade_tarefa,
    sort,
    page = 1,
    limit = 10,
  } = req.query;
  try {
    const tasks = await Task.findAll();

    // Include HATEOAS links in the response
    const response = tasks.map((task) => ({
      ...task.toJSON(),
      links: {
        self: `/tasks/${task.id}`,
      },
    }));
    res.status(200).json(response);
  } catch (error) {
    // Handle specific errors: 400, 401 and 500
    if (error.name === "BadRequestError") {
      const err = new Error("Invalid query parameters.");
      err.status = 400;
      err.errors = error.errors.map((e) => {
        if (e.path === "tipo_tarefa") {
          return "Invalid value.";
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
    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};

// Controller to create a new task
export const createTask = async (req, res, next) => {
  try {
    const { nome, tipo_tarefa, localizacao_tarefa, prioridade_tarefa } =
      req.body;
    if (!nome) {
      const err = new Error("Validation failed.");
      err.status = 400;
      err.errors = error.errors.map((e) => {
        if (e.path === "nome") {
          return "Name is mandatory.";
        }
        if (e.path === "tipo_tarefa") {
          return "Invalid task type.";
        }
      });
      return next(err);
    }
    const task = await Task.create({
      nome,
      tipo_tarefa,
      localizacao_tarefa,
      prioridade_tarefa,
    });
    // Include HATEOAS links in the response
    const response = {
      ...task.toJSON(),
      links: {
        self: `/tasks/${task.id}`,
      },
    };
    res.status(201).json(response);
  } catch (error) {
    // Handle specific errors: 400, 401, 403, 409 and 500
    if (error.name === "UnauthorizedError") {
      const err = new Error("Missing or invalid authentication token.");
      err.status = 401;
      return next(err);
    }
    if (error.name === "ForbiddenError") {
      const err = new Error("You do not have permission to create tasks.");
      err.status = 403;
      return next(err);
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      const err = new Error("A task with this name already exists.");
      err.status = 409;
      return next(err);
    }
    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};

// Controller to get a task by ID
export const getTaskById = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findByPk(taskId);
    if (!task) {
      const err = new Error("Resource not found.");
      err.status = 404;
      return next(err);
    }
    // Include HATEOAS links in the response
    const response = {
      ...task.toJSON(),
      links: {
        self: `/tasks/${task.id}`,
      },
    };
    res.status(200).json(response);
  } catch (error) {
    // Handle specific errors: 400, 401, 403, 404 and 500
    if (error.name === "BadRequestError") {
      const err = new Error("Invalid request.");
      err.status = 400;
      error.errors.map((e) => {
        if (e.path === "taskId") {
          return "Invalid task ID.";
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

// Controller to update a task
export const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { nome, tipo_tarefa, localizacao_tarefa, prioridade_tarefa } =
      req.body;
    const task = await Task.findByPk(taskId);
    if (!task) {
      const err = new Error("Resource not found.");
      err.status = 404;
      return next(err);
    }
    const updated = await task.update(req.body);

    // Include HATEOAS links in the response
    const response = {
      ...updated.toJSON(),
      links: {
        self: `/tasks/${task.id}`,
      },
    };
    res.status(200).json(response);
  } catch (error) {
    // Handle specific errors: 400, 401, 403, 404, 409 and 500
    if (error.name === "BadRequestError") {
      const err = new Error("Invalid request.");
      err.status = 400;
      error.errors.map((e) => {
        if (e.path === "tipo_tarefa") {
          return "Invalid value.";
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
      const err = new Error("You do not have permission to update tasks.");
      err.status = 403;
      return next(err);
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      const err = new Error("A task with this name already exists.");
      err.status = 409;
      error.errors.map((e) => {
        if (e.path === "nome") {
          return "A task with this name already exists.";
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

// Controller to delete a task
export const deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findByPk(taskId);
    if (!task) {
      const err = new Error("Resource not found.");
      err.status = 404;
      error.errors.map((e) => {
        if (e.path === "taskId") {
          return "Task not found.";
        }
        return e.message;
      });
      err.errors = errors;
      return next(err);
    }
    await task.destroy();
    res.status(204).send();
  } catch (error) {
    // Handle specific errors: 400, 401, 403, 404 and 500
    if (error.name === "BadRequestError") {
      const err = new Error("Invalid request.");
      err.status = 400;
      error.errors.map((e) => {
        if (e.path === "taskId") {
          return "Invalid task ID.";
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
      const err = new Error("You do not have permission to delete tasks.");
      err.status = 403;
      return next(err);
    }
    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};
