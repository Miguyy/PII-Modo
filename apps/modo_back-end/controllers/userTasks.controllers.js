/*
  Purpose: Controller functions to list, assign, update, complete and
  delete tasks assigned to users (UserTask join/resource). Responses
  include HATEOAS links and validation/conflict errors are forwarded
  to `next()`.
*/

// Import user tasks data
import { UserTasks as UserTask, User, Task, Habit, Notification, AvatarDecoration } from "../config/db.config.js";
import { Op } from "sequelize";
import {
  validationError,
  forbiddenError,
  notFoundError,
  conflictError,
  genericError,
} from "../utils/errors.utils.js";

/**
 * getAllUserTasks(req, res, next)
 * Retrieves all UserTask records for a given `userId` (and optional
 * `habitId`) and returns them with HATEOAS `self` links. Forwards 500
 * on internal errors.
 */
// Controller to get all user tasks
export const getAllUserTasks = async (req, res, next) => {
  try {
    const { userId, habitId } = req.params;
    const {
      page = 1,
      limit = 5,
      sort = "id_tarefa",
      order = "ASC",
    } = req.query;

    // Authorization: only admin or the owner can list user tasks
    const requester = req.user;
    const requesterRole = (
      (requester &&
        (requester.tipo_utilizador || requester.dataValues?.tipo_utilizador)) ||
      ""
    ).toLowerCase();
    const requesterId =
      requester &&
      (requester.id_utilizador || requester.dataValues?.id_utilizador);
    if (requesterRole !== "admin" && Number(requesterId) !== Number(userId)) {
      return next(forbiddenError());
    }

    // Query with pagination and optional sorting
    const parsedPage = Math.max(Number(page) || 1, 1);
    const parsedLimit = Math.min(Math.max(Number(limit) || 5, 1), 100);
    const offset = (parsedPage - 1) * parsedLimit;

    const safeSortFields = new Set(["id_tarefa", "progresso", "estado_tarefa"]);
    const sortField = safeSortFields.has(sort) ? sort : "id_tarefa";
    const sortOrder = String(order).toUpperCase() === "DESC" ? "DESC" : "ASC";

    const userTaskWhere = { id_utilizador: Number(userId) };
    if (habitId) {
      // We'll filter later when populating tasks to avoid join complexity
    }

    const { rows, count } = await UserTask.findAndCountAll({
      where: userTaskWhere,
      order: [[sortField, sortOrder]],
      limit: parsedLimit,
      offset,
    });

    // Bulk fetch all Tasks and their parent Habits to avoid N+1 query delay
    const taskIds = rows.map((ut) => ut.id_tarefa);
    let tasksMap = new Map();
    
    if (taskIds.length > 0) {
      const tasks = await Task.findAll({
        where: { id_tarefa: taskIds },
        include: [{ model: Habit, attributes: ['categoria'] }],
      });
      
      for (const t of tasks) {
        const taskJson = t.toJSON();
        // Flatten categoria from the nested Habit association
        if (taskJson.Habito) {
          taskJson.categoria = taskJson.Habito.categoria ?? null;
          delete taskJson.Habito;
        }
        tasksMap.set(taskJson.id_tarefa, taskJson);
      }
    }

    const response = [];
    for (const ut of rows) {
      const utJson = ut.toJSON();
      const taskJson = tasksMap.get(utJson.id_tarefa) || null;
      
      if (habitId && (!taskJson || taskJson.id_habito !== Number(habitId)))
        continue;

      response.push({
        ...utJson,
        task: taskJson,
        links: [
          {
            rel: "self",
            method: "GET",
            href: `/users/${userId}/tasks/${utJson.id_tarefa}`,
          },
        ],
      });
    }

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
    console.error("getAllUserTasks error:", error);
    return next(genericError());
  }
};

/**
 * assignTaskToUser(req, res, next)
 * Validates the `taskId` provided in the body, prevents duplicate
 * assignments, creates a new UserTask (progress 0, completed false)
 * and returns HTTP 201 with a `self` link. Forwards validation (400)
 * or conflict (409) errors via `next()`.
 */
// Controller to assign a task to a user
export const assignTaskToUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { taskId } = req.body;

    // Authorization: owner or admin may assign tasks to the user
    const requester = req.user;
    const requesterRole = (
      (requester &&
        (requester.tipo_utilizador || requester.dataValues?.tipo_utilizador)) ||
      ""
    ).toLowerCase();
    const requesterId =
      requester &&
      (requester.id_utilizador || requester.dataValues?.id_utilizador);
    if (requesterRole !== "admin" && Number(requesterId) !== Number(userId)) {
      return next(forbiddenError());
    }

    // Allow either assigning an existing task by `taskId` or creating
    // a new task inline (payload contains task fields like `nome_tarefa`).
    let resolvedTaskId = null;

    if (taskId && /^\d+$/.test(String(taskId))) {
      resolvedTaskId = Number(taskId);
    } else if (req.body.nome_tarefa || req.body.nome) {
      // Create a new Task using provided payload fields
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
        return next(validationError({ nome: ["Name is mandatory."] }));
      }

      const created = await Task.create({
        id_habito: id_habito ?? null,
        nome_tarefa: name,
        pontos_tarefa: pontos_tarefa ?? 0,
        tipo_tarefa,
        localizacao_tarefa,
        prioridade_tarefa,
        duracao_temporizador: duracao_temporizador ?? null,
        quantidade_necessaria: quantidade_necessaria ?? null,
      });

      resolvedTaskId = created.toJSON().id_tarefa;
    } else {
      return next(validationError({ taskId: ["Invalid task ID."] }));
    }

    const existing = await UserTask.findOne({
      where: {
        id_utilizador: Number(userId),
        id_tarefa: Number(resolvedTaskId),
      },
    });

    if (existing) {
      if (existing.estado_tarefa === "Completed") {
        // Reactivate a previously completed task
        await existing.update({
          estado_tarefa: "Pending",
          progresso: 0,
          data_conclusao: null,
          data_inicio: new Date(),
        });
        
        return res.status(200).json({
          ...existing.toJSON(),
          links: [
            {
              rel: "self",
              method: "GET",
              href: `/users/${userId}/tasks/${resolvedTaskId}`,
            },
          ],
        });
      }

      return next(
        conflictError({ userTask: ["Task already assigned to user."] }),
      );
    }

    const userTask = await UserTask.create({
      id_utilizador: Number(userId),
      id_tarefa: Number(resolvedTaskId),
      progresso: 0,
      tarefa_ativa: true,
      estado_tarefa: "Pending",
      data_inicio: new Date(),
    });

    // Include HATEOAS links as the response
    res.status(201).json({
      ...userTask.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/users/${userId}/tasks/${resolvedTaskId}`,
        },
      ],
    });
  } catch (error) {
    console.error("assignTaskToUser error:", error);
    return next(genericError());
  }
};

/**
 * assignHabitTasksToUser(req, res, next)
 * Assigns all tasks belonging to a habit to the specified user.
 * Accepts `{ habitId }` or `{ id_habito }` in the request body.
 */
export const assignHabitTasksToUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const habitId = req.body.habitId ?? req.body.id_habito;

    // Authorization: owner or admin may batch-assign habit tasks
    const requester = req.user;
    const requesterRole = (
      (requester &&
        (requester.tipo_utilizador || requester.dataValues?.tipo_utilizador)) ||
      ""
    ).toLowerCase();
    const requesterId =
      requester &&
      (requester.id_utilizador || requester.dataValues?.id_utilizador);
    if (requesterRole !== "admin" && Number(requesterId) !== Number(userId)) {
      return next(forbiddenError());
    }

    if (!habitId || !/^\d+$/.test(String(habitId))) {
      return next(validationError({ habitId: ["Invalid habit ID."] }));
    }

    // Find all tasks for the habit
    const tasks = await Task.findAll({ where: { id_habito: Number(habitId) } });

    if (!tasks || tasks.length === 0) {
      return next(notFoundError("HabitTasks", habitId));
    }

    const created = [];
    const skipped = [];

    for (const t of tasks) {
      const tid = t.toJSON().id_tarefa;
      const exists = await UserTask.findOne({
        where: { id_utilizador: Number(userId), id_tarefa: Number(tid) },
      });
      
      if (exists) {
        if (exists.estado_tarefa === "Completed") {
          // Reactivate completed task
          await exists.update({
            estado_tarefa: "Pending",
            progresso: 0,
            data_conclusao: null,
            data_inicio: new Date(),
          });
          created.push(exists.toJSON());
        } else {
          skipped.push(tid);
        }
        continue;
      }

      const ut = await UserTask.create({
        id_utilizador: Number(userId),
        id_tarefa: Number(tid),
        progresso: 0,
        tarefa_ativa: true,
        estado_tarefa: "Pending",
        data_inicio: new Date(),
      });
      created.push(ut.toJSON());
    }

    res.status(201).json({
      description: "Tasks assigned.",
      created: created.length,
      skipped: skipped.length,
      createdItems: created,
      links: [{ rel: "self", method: "GET", href: `/users/${userId}/tasks` }],
    });
  } catch (error) {
    console.error("assignHabitTasksToUser error:", error);
    return next(genericError());
  }
};

/**
 * deleteUserTask(req, res, next)
 * Deletes the UserTask identified by `userId` and `taskId`. Returns
 * HTTP 204 on success. If no record was deleted, forwards 404.
 */
// Controller to delete a user task
export const deleteUserTask = async (req, res, next) => {
  try {
    const { userId, taskId } = req.params;
    // Authorization: owner or admin may delete user tasks
    const requester = req.user;
    const requesterRole = (
      (requester &&
        (requester.tipo_utilizador || requester.dataValues?.tipo_utilizador)) ||
      ""
    ).toLowerCase();
    const requesterId =
      requester &&
      (requester.id_utilizador || requester.dataValues?.id_utilizador);
    if (requesterRole !== "admin" && Number(requesterId) !== Number(userId)) {
      return next(forbiddenError());
    }
    const deleted = await UserTask.destroy({
      where: { id_utilizador: Number(userId), id_tarefa: Number(taskId) },
    });

    if (!deleted) {
      return next(notFoundError("UserTask", `${userId}-${taskId}`));
    }

    res.status(204).send();
  } catch (error) {
    console.error("deleteUserTask error:", error);
    return next(genericError());
  }
};

/**
 * getUserTaskById(req, res, next)
 * Returns the `req.userTask` record (attached by middleware) with a
 * `self` HATEOAS link. Forwards 500 on internal failures.
 */
// Controller to get a user task by ID
export const getUserTaskById = async (req, res, next) => {
  try {
    const userTask = req.userTask;

    // Authorization: owner or admin may fetch this user task
    const requester = req.user;
    const requesterRole = (
      (requester &&
        (requester.tipo_utilizador || requester.dataValues?.tipo_utilizador)) ||
      ""
    ).toLowerCase();
    const requesterId =
      requester &&
      (requester.id_utilizador || requester.dataValues?.id_utilizador);
    if (
      requesterRole !== "admin" &&
      Number(requesterId) !== Number(req.params.userId)
    ) {
      return next(forbiddenError());
    }

    // Include HATEOAS links in the response
    res.status(200).json({
      ...userTask.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/users/${req.params.userId}/tasks/${req.params.taskId}`,
        },
      ],
    });
  } catch (error) {
    console.error("getUserTaskById error:", error);
    return next(genericError());
  }
};

/**
 * updateUserTask(req, res, next)
 * Updates the `progress` value of the `req.userTask`. Returns the
 * updated resource with a `self` link. Forwards 500 on internal
 * failures.
 */
// Controller to update a user task
export const updateUserTask = async (req, res, next) => {
  try {
    const userTask = req.userTask;
    // Authorization: owner or admin may update progress
    const requester = req.user;
    const requesterRole = (
      (requester &&
        (requester.tipo_utilizador || requester.dataValues?.tipo_utilizador)) ||
      ""
    ).toLowerCase();
    const requesterId =
      requester &&
      (requester.id_utilizador || requester.dataValues?.id_utilizador);
    if (
      requesterRole !== "admin" &&
      Number(requesterId) !== Number(req.params.userId)
    ) {
      return next(forbiddenError());
    }
    // Accept both `progress` (EN) and `progresso` (PT) from clients
    const { progress, progresso } = req.body;
    const raw = progress ?? progresso;
    const value = Number(raw);
    if (Number.isNaN(value)) {
      return next(validationError({ progresso: ["Invalid progress value."] }));
    }

    await userTask.update({ progresso: value });

    // Include HATEOAS links in the response
    res.status(200).json({
      ...userTask.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/users/${req.params.userId}/tasks/${req.params.taskId}`,
        },
      ],
    });
  } catch (error) {
    console.error("updateUserTask error:", error);
    return next(genericError());
  }
};

/**
 * completeUserTask(req, res, next)
 * Marks `req.userTask` as completed and sets progress to 100. Returns
 * the updated record with a `self` link. Forwards 500 on error.
 */
// Controller to complete a user task
export const completeUserTask = async (req, res, next) => {
  try {
    const userTask = req.userTask;

    // Authorization: owner or admin may complete the task
    const requester = req.user;
    const requesterRole = (
      (requester &&
        (requester.tipo_utilizador || requester.dataValues?.tipo_utilizador)) ||
      ""
    ).toLowerCase();
    const requesterId =
      requester &&
      (requester.id_utilizador || requester.dataValues?.id_utilizador);
    if (
      requesterRole !== "admin" &&
      Number(requesterId) !== Number(req.params.userId)
    ) {
      return next(forbiddenError());
    }

    await userTask.update({
      estado_tarefa: "Completed",
      progresso: 100,
      data_conclusao: new Date(),
    });

    // Award points concurrently before responding to prevent frontend race conditions
    try {
      const [task, user] = await Promise.all([
        Task.findByPk(userTask.id_tarefa),
        User.findByPk(userTask.id_utilizador),
      ]);
      const pontos = task ? (task.pontos_tarefa || 0) : 0;
      if (pontos > 0 && user) {
        const oldNivel = user.nivel || 0;
        const newPontos = (user.pontos || 0) + pontos;
        const newNivel = Math.floor(newPontos / 100);
        await user.update({ 
          pontos: newPontos,
          nivel: newNivel
        });
        
        if (newNivel > oldNivel) {
          await Notification.create({
            id_utilizador: user.id_utilizador,
            tipo_notificacao: 'Level',
            mensagem: `Congratulations! You've leveled up to Level ${newNivel}!`,
          });
          
          const unlockedDecorations = await AvatarDecoration.findAll({
            where: {
              nivel_necessario: {
                [Op.gt]: oldNivel,
                [Op.lte]: newNivel
              }
            }
          });
          
          for (const dec of unlockedDecorations) {
            await Notification.create({
              id_utilizador: user.id_utilizador,
              tipo_notificacao: 'Avatar',
              mensagem: `Congratulations! You've unlocked the "${dec.nome_decoracao}" avatar decoration!`,
            });
          }
        }
        
        console.log(`[POINTS] User ${userTask.id_utilizador} +${pontos} pts (task ${userTask.id_tarefa}). Total: ${newPontos}, Level: ${newNivel}`);
      }
    } catch (err) {
      console.error("[POINTS] Award failed:", err);
    }

    res.status(200).json({
      ...userTask.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/users/${req.params.userId}/tasks/${req.params.taskId}`,
        },
      ],
    });
  } catch (error) {
    console.error("completeUserTask error:", error);
    if (error.name === "SequelizeValidationError") {
      return next(
        validationError({ validation: error.errors.map((e) => e.message) }),
      );
    }
    return next(genericError());
  }
};
