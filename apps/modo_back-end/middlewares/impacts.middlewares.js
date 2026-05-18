/*
  Purpose: Middleware utilities for Impact-related routes. Exposes
  validation middleware for route parameters used by impact handlers.
*/
/**
 * validateTaskId(req, res, next)
 * Validates that the `taskId` route parameter is a positive integer.
 * Responds with HTTP 400 and an error object when invalid, otherwise
 * calls `next()`.
 */
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
