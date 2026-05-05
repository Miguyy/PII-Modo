/*
  Purpose: Controller functions to list, assign, update, complete and
  delete tasks assigned to users (UserTask join/resource). Responses
  include HATEOAS links and validation/conflict errors are forwarded
  to `next()`.
*/
// Import user tasks data
import { UserTask, User, Task } from "../config/db.config.js";

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

    const userTasks = await UserTask.findAll({
      where: { userId },
      include: {
        model: Task,
        where: { habitId },
      },
    });
    // Include HATEOAS links in the response
    const response = userTasks.map((ut) => ({
      ...ut.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/users/${userId}/tasks/${ut.taskId}`,
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

    if (!taskId || !/^\d+$/.test(taskId)) {
      return next({
        status: 400,
        message: "Validation failed.",
        errors: { taskId: ["Invalid task ID."] },
      });
    }

    const existing = await UserTask.findOne({
      where: { userId, taskId },
    });

    if (existing) {
      return next({
        status: 409,
        message: "Resource conflict.",
        errors: { userTask: ["Task already assigned to user."] },
      });
    }

    const userTask = await UserTask.create({
      userId,
      taskId,
      progress: 0,
      completed: false,
    });

    // Include HATEOAS links as the response
    res.status(201).json({
      ...userTask.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/users/${userId}/tasks/${taskId}`,
        },
      ],
    });
  } catch (error) {
    // Handle specific errors: 500
    return next({ status: 500, message: "Internal server error." });
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
    const deleted = await UserTask.destroy({
      where: { userId, taskId },
    });

    if (!deleted) {
      return next({ status: 404, message: "Resource not found." });
    }

    res.status(204).send();
  } catch (error) {
    // Handle specific errors: 500
    return next({ status: 500, message: "Internal server error." });
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

    // Include HATEOAS links in the response
    res.status(200).json({
      ...userTask.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/users/${userTask.userId}/tasks/${userTask.taskId}`,
        },
      ],
    });
  } catch (error) {
    // Handle specific errors: 500
    return next({ status: 500, message: "Internal server error." });
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
    const { progress } = req.body;

    await userTask.update({
      progress: typeof progress === "number" ? progress : userTask.progress,
    });

    // Include HATEOAS links in the response
    res.status(200).json({
      ...userTask.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/users/${userTask.userId}/tasks/${userTask.taskId}`,
        },
      ],
    });
  } catch (error) {
    // Handle specific errors: 500
    return next({ status: 500, message: "Internal server error." });
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

    await userTask.update({
      completed: true,
      progress: 100,
    });

    // Include HATEOAS links in the response
    res.status(200).json({
      ...userTask.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/users/${userTask.userId}/tasks/${userTask.taskId}`,
        },
      ],
    });
  } catch (error) {
    // Handle specific errors: 500
    return next({ status: 500, message: "Internal server error." });
  }
};
