// Import impacts data
import { Impact } from "../config/db.config.js";

// Controller to get all impacts
export const getAllImpacts = async (req, res, next) => {
  try {
    const impacts = await Impact.findAll();

    // Include HATEOAS links in the response
    const response = impacts.map((impact) => ({
      ...impact.toJSON(),
      links: [{ rel: "self", method: "GET", href: `/impacts/${impact.id}` }],
    }));
    res.status(200).json(response);
  } catch (error) {
    // Handle specific errors: 500
    return next({
      status: 500,
      message: "Internal server error.",
    });
  }
};

// Controller to get impacts for a specific task
export const getTaskImpacts = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const impacts = await Impact.findAll({ where: { taskId } });

    if (!impacts || impacts.length === 0) {
      return next({
        status: 404,
        message: "No impacts found for the specified task.",
      });
    }

    // Include HATEOAS links in the response
    const response = impacts.map((impact) => ({
      ...impact.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/tasks/${taskId}/impacts/${impact.id}`,
        },
      ],
    }));
    res.status(200).json(response);
  } catch (error) {
    // Handle specific errors: 400, 401, 403, 404 and 500
    return next({
      status: 500,
      message: "Internal server error.",
    });
  }
};
