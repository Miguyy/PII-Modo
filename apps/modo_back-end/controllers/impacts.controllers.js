/*
  Purpose: Controllers for the Impact resource. Provides handlers to
  list all impacts and list impacts associated with a specific task.
  Responses include HATEOAS `self` links and errors are forwarded to
  `next()`.
*/

// Import impacts data
import { Impact } from "../config/db.config.js";

/**
 * getAllImpacts(req, res, next)
 * Retrieves all Impact records and returns them as JSON with HATEOAS
 * `self` links. Forwards internal errors (500) via `next()`.
 */
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

/**
 * getTaskImpacts(req, res, next)
 * Retrieves Impact records filtered by `taskId` (from params). If no
 * impacts are found, forwards a 404. Returns a list of impacts with
 * `self` HATEOAS links on success.
 */
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
