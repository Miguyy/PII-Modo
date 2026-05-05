/*
  Purpose: Validation and existence-check middleware for Task
  endpoints. Provides payload validation, `taskId` validation and a
  middleware that attaches a Task instance to `req.task` when present.
*/
import { Task } from "../config/db.config.js";

/**
 * validateCreateTask(req, res, next)
 * Validates request body fields when creating a Task. Ensures required
 * `nome` is present and that optional fields are of the correct type.
 * Returns HTTP 400 with error details on validation failure.
 */
export const validateCreateTask = (req, res, next) => {
  const { nome, tipo_tarefa, localizacao_tarefa, prioridade_tarefa } = req.body;
  const errors = {};

  if (!nome || typeof nome !== "string" || nome.trim() === "") {
    errors.nome = ["Name is mandatory."];
  }

  if (tipo_tarefa && typeof tipo_tarefa !== "string") {
    errors.tipo_tarefa = ["Invalid task type."];
  }

  if (localizacao_tarefa && typeof localizacao_tarefa !== "string") {
    errors.localizacao_tarefa = ["Invalid location."];
  }

  if (prioridade_tarefa && typeof prioridade_tarefa !== "string") {
    errors.prioridade_tarefa = ["Invalid priority."];
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      description: "Validation failed.",
      errors,
    });
  }

  next();
};

/**
 * validateTaskId(req, res, next)
 * Validates that `taskId` route parameter is a positive integer and
 * returns HTTP 400 on invalid values.
 */
export const validateTaskId = (req, res, next) => {
  const { taskId } = req.params;

  if (!Number.isInteger(Number(taskId)) || Number(taskId) <= 0) {
    return res.status(400).json({
      description: "Invalid request.",
      errors: { taskId: ["Invalid task ID format."] },
    });
  }

  next();
};

/**
 * checkTaskExists(req, res, next)
 * Loads a Task by `taskId` and attaches it to `req.task`. If the
 * task does not exist responds with 404 and an error object.
 */
export const checkTaskExists = async (req, res, next) => {
  const { taskId } = req.params;
  const task = await Task.findByPk(taskId);

  if (!task) {
    return res.status(404).json({
      description: "Resource not found.",
      errors: { taskId: ["Task not found."] },
    });
  }

  req.task = task;
  next();
};
