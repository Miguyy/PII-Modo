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
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/tasks/${task.toJSON().id_tarefa}`,
        },
      ],
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
    const {
      id_habito,
      nome_tarefa,
      nome,
      pontos_tarefa,
      tipo_tarefa,
      localizacao_tarefa,
      prioridade_tarefa,
      duracao_temporizador,
      quantidade_necessaria,
    } = req.body;

    const name = nome_tarefa ?? nome;
    if (!name) {
      return next({
        status: 400,
        message: "Validation failed.",
        errors: { nome: ["Name is mandatory."] },
      });
    }

    const task = await Task.create({
      id_habito: id_habito ?? null,
      nome_tarefa: name,
      pontos_tarefa: pontos_tarefa ?? 0,
      tipo_tarefa,
      localizacao_tarefa,
      prioridade_tarefa,
      duracao_temporizador: duracao_temporizador ?? null,
      quantidade_necessaria: quantidade_necessaria ?? null,
    });

    res.status(201).json({
      ...task.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/tasks/${task.toJSON().id_tarefa}`,
        },
      ],
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      return next({
        status: 400,
        message: "Validation failed.",
        errors: { validation: error.errors.map((e) => e.message) },
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
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/tasks/${task.toJSON().id_tarefa}`,
        },
      ],
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
    const {
      id_habito,
      nome_tarefa,
      nome,
      pontos_tarefa,
      tipo_tarefa,
      localizacao_tarefa,
      prioridade_tarefa,
      duracao_temporizador,
      quantidade_necessaria,
    } = req.body;

    const payload = {};
    if (id_habito !== undefined) payload.id_habito = id_habito;
    if ((nome_tarefa ?? nome) !== undefined)
      payload.nome_tarefa = nome_tarefa ?? nome;
    if (pontos_tarefa !== undefined) payload.pontos_tarefa = pontos_tarefa;
    if (tipo_tarefa !== undefined) payload.tipo_tarefa = tipo_tarefa;
    if (localizacao_tarefa !== undefined)
      payload.localizacao_tarefa = localizacao_tarefa;
    if (prioridade_tarefa !== undefined)
      payload.prioridade_tarefa = prioridade_tarefa;
    if (duracao_temporizador !== undefined)
      payload.duracao_temporizador = duracao_temporizador;
    if (quantidade_necessaria !== undefined)
      payload.quantidade_necessaria = quantidade_necessaria;

    // Server-side validation to avoid DB/Sequelize enum or constraint errors
    const errors = {};
    const allowedTipos = ["Check", "Count", "Timer"];
    const allowedLocalizacoes = ["Inside", "Outside"];
    const allowedPrioridades = ["Low", "Medium", "High"];

    const finalTipo =
      payload.tipo_tarefa !== undefined
        ? payload.tipo_tarefa
        : task.tipo_tarefa;

    if (
      payload.tipo_tarefa !== undefined &&
      !allowedTipos.includes(payload.tipo_tarefa)
    ) {
      errors.tipo_tarefa = [
        "Invalid tipo_tarefa. Allowed: Check, Count, Timer.",
      ];
    }

    if (
      payload.localizacao_tarefa !== undefined &&
      !allowedLocalizacoes.includes(payload.localizacao_tarefa)
    ) {
      errors.localizacao_tarefa = [
        "Invalid localizacao_tarefa. Allowed: Inside, Outside.",
      ];
    }

    if (
      payload.prioridade_tarefa !== undefined &&
      !allowedPrioridades.includes(payload.prioridade_tarefa)
    ) {
      errors.prioridade_tarefa = [
        "Invalid prioridade_tarefa. Allowed: Low, Medium, High.",
      ];
    }

    if (
      payload.duracao_temporizador !== undefined &&
      payload.duracao_temporizador !== null
    ) {
      if (
        !Number.isInteger(Number(payload.duracao_temporizador)) ||
        Number(payload.duracao_temporizador) <= 0
      ) {
        errors.duracao_temporizador = [
          "Invalid duracao_temporizador. Must be a positive integer or null.",
        ];
      }
    }

    if (
      payload.quantidade_necessaria !== undefined &&
      payload.quantidade_necessaria !== null
    ) {
      if (
        !Number.isInteger(Number(payload.quantidade_necessaria)) ||
        Number(payload.quantidade_necessaria) <= 0
      ) {
        errors.quantidade_necessaria = [
          "Invalid quantidade_necessaria. Must be a positive integer or null.",
        ];
      }
    }

    // Enforce Timer/Count specific requirements
    if (finalTipo === "Timer") {
      const dur =
        payload.duracao_temporizador !== undefined
          ? payload.duracao_temporizador
          : task.duracao_temporizador;
      if (dur === null || dur === undefined || Number(dur) <= 0) {
        errors.duracao_temporizador = [
          "duracao_temporizador must be greater than 0 when tipo_tarefa is 'Timer'.",
        ];
      }
    }

    if (finalTipo === "Count") {
      const qtd =
        payload.quantidade_necessaria !== undefined
          ? payload.quantidade_necessaria
          : task.quantidade_necessaria;
      if (qtd === null || qtd === undefined || Number(qtd) <= 0) {
        errors.quantidade_necessaria = [
          "quantidade_necessaria must be greater than 0 when tipo_tarefa is 'Count'.",
        ];
      }
    }

    if (Object.keys(errors).length > 0) {
      return next({ status: 400, message: "Validation failed.", errors });
    }

    const updated = await task.update(payload);

    res.status(200).json({
      ...updated.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/tasks/${updated.toJSON().id_tarefa}`,
        },
      ],
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      return next({
        status: 400,
        message: "Validation failed.",
        errors: { validation: error.errors.map((e) => e.message) },
      });
    }
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
