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

    // Include HATEOAS links in the response (use model column names)
    const response = impacts.map((impact) => ({
      ...impact.toJSON(),
      links: [
        { rel: "self", method: "GET", href: `/impacts/${impact.id_impacto}` },
      ],
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

    // Use the model column name `id_tarefa` in the WHERE clause
    const impacts = await Impact.findAll({
      where: { id_tarefa: Number(taskId) },
    });

    // Return an empty array if there are no impacts for the task
    if (!impacts || impacts.length === 0) {
      return res.status(200).json([]);
    }

    // Include HATEOAS links in the response (use model column names)
    const response = impacts.map((impact) => ({
      ...impact.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/tasks/${taskId}/impacts/${impact.id_impacto}`,
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

/**
 * createImpact(req, res, next)
 * Creates an Impact record for a given task (taskId param).
 */
export const createImpact = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { tipo_impacto, valor_por_unidade, unidade } = req.body;

    if (!tipo_impacto || !valor_por_unidade || !unidade) {
      return next({
        status: 400,
        message: "Validation failed.",
        errors: {
          tipo_impacto: ["Required"],
          valor_por_unidade: ["Required"],
          unidade: ["Required"],
        },
      });
    }

    const value = Number(valor_por_unidade);
    if (Number.isNaN(value) || value <= 0)
      return next({ status: 400, message: "Invalid valor_por_unidade." });

    const impact = await Impact.create({
      id_tarefa: Number(taskId),
      tipo_impacto,
      valor_por_unidade: value,
      unidade,
    });

    res.status(201).json({
      ...impact.toJSON(),
      links: [
        { rel: "self", method: "GET", href: `/impacts/${impact.id_impacto}` },
      ],
    });
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};

/**
 * deleteImpact(req, res, next)
 * Deletes an Impact by its id_impacto.
 */
export const deleteImpact = async (req, res, next) => {
  try {
    const { impactId } = req.params;
    const impact = await Impact.findByPk(impactId);
    if (!impact) return next({ status: 404, message: "Impact not found." });

    await impact.destroy();
    res.status(204).send();
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};
