// Import impacts data
import { Impact } from "../config/db.config.js";

// Controller to get all impacts
export const getAllImpacts = async (req, res, next) => {
  const { impactId } = req.params;
  try {
    const impacts = await Impact.findAll();
    res.status(200).json(impacts);
  } catch (error) {
    // Handle specific errors: 401 and 500
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

// Controller to get impacts for a specific task
export const getTaskImpacts = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const impacts = await Impact.findByTaskId(taskId);
    res.status(200).json(impacts);
  } catch (error) {
    // Handle specific errors: 400, 401, 403, 404 and 500
    if (error.name === "BadRequestError") {
      error.status = 400;
      error.errors.map((e) => {
        if (e.path === "taskId") {
          return "Invalid task ID.";
        }
        return e.message;
      });
      error.errors = errors;
      return next(error);
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
    if (error.name === "NotFoundError") {
      const err = new Error("Resource not found.");
      err.status = 404;
      errors.errors.map((e) => {
        if (e.path === "taskId") {
          return "Task not found.";
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
