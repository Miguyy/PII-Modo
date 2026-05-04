export const validateUserTaskIds = (req, res, next) => {
  const { userId, taskId } = req.params;
  const errors = {};

  if (!/^\d+$/.test(userId)) {
    errors.userId = ["Invalid user ID."];
  }

  if (taskId && !/^\d+$/.test(taskId)) {
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
