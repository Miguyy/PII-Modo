/*
  Purpose: Validation and existence-check middleware for endpoints
  managing tasks assigned to users. Provides parameter validators and
  a loader middleware that attaches a `UserTask` instance to `req`.
*/
/**
 * validateUserTaskIds(req, res, next)
 * Validates `userId` and optional `taskId` route parameters. Ensures
 * they are positive integers and responds with HTTP 400 and details
 * when validation fails.
 */

export const validateUserTaskIds = (req, res, next) => {
  const { userId, taskId } = req.params;
  const errors = {};

  if (!/^[0-9]+$/.test(userId)) {
    errors.userId = ["Invalid user ID."];
  }

  if (taskId && !/^[0-9]+$/.test(taskId)) {
    errors.taskId = ["Invalid task ID."];
  }

  if (taskId && !Number.isInteger(Number(taskId))) {
    errors.taskId = ["Invalid task ID."];
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
 * checkUserTaskExists(req, res, next)
 * Loads a UserTask by `userId` and `taskId`. If not found responds with
 * HTTP 404; otherwise attaches the found instance to `req.userTask`.
 */
export const checkUserTaskExists = async (req, res, next) => {
  const { userId, taskId } = req.params;

  const userTask = await UserTask.findOne({
    where: { userId, taskId },
  });

  if (!userTask) {
    return res.status(404).json({
      description: "Resource not found.",
      errors: { userTask: ["User task not found."] },
    });
  }

  req.userTask = userTask;
  next();
};
