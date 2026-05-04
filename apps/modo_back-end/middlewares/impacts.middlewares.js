export const validateTaskId = (req, res, next) => {
  const { taskId } = req.params;

  if (!Number.isInteger(Number(taskId)) || Number(taskId) <= 0) {
    return res.status(400).json({
      description: "Invalid request.",
      errors: {
        taskId: ["Invalid task ID format."],
      },
    });
  }
  next();
};
