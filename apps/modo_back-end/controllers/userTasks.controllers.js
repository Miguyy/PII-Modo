// Import user tasks data
import { UserTask, User, Task } from "../config/db.config.js";

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
