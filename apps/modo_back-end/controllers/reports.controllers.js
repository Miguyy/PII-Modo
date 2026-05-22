/*
  Purpose: HTTP controllers for Reports generation and retrieval.
  Includes protections against Mass Assignment by destructuring req.body.
*/

import { Report } from "../config/db.config.js";

/**
 * getAllReports(req, res, next)
 * Retrieves all reports from the database.
 */
export const getAllReports = async (req, res, next) => {
  try {
    const reports = await Report.findAll();

    const response = reports.map((report) => ({
      ...report.toJSON(),
      links: [{ rel: "self", method: "GET", href: `/reports/${report.id}` }],
    }));

    res.status(200).json(response);
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};

/**
 * createReport(req, res, next)
 * Creates a new Report using `mes` and `semana`.
 */
export const createReport = async (req, res, next) => {
  try {
    // Security Protection: Extract only the allowed fields
    const { mes, semana } = req.body;

    const report = await Report.create({ mes, semana });

    res.status(201).json({
      ...report.toJSON(),
      links: [{ rel: "self", method: "GET", href: `/reports/${report.id}` }],
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return next({
        status: 409,
        message: "Resource conflict.",
        errors: { report: ["A report for this specific period already exists."] },
      });
    }
    return next({ status: 500, message: "Internal server error." });
  }
};

/**
 * getReportById(req, res, next)
 * Returns the report attached to `req.report`.
 */
export const getReportById = async (req, res, next) => {
  try {
    const report = req.report;

    res.status(200).json({
      ...report.toJSON(),
      links: [{ rel: "self", method: "GET", href: `/reports/${report.id}` }],
    });
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};

/**
 * updateReport(req, res, next)
 * Updates the report instance.
 */
export const updateReport = async (req, res, next) => {
  try {
    const report = req.report;

    // Security Protection: Extract only the allowed fields for update
    const { mes, semana } = req.body;

    const updated = await report.update({
      mes: mes ?? report.mes,
      semana: semana ?? report.semana,
    });

    res.status(200).json({
      ...updated.toJSON(),
      links: [{ rel: "self", method: "GET", href: `/reports/${report.id}` }],
    });
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};

/**
 * deleteReport(req, res, next)
 * Deletes the report attached to `req.report`.
 */
export const deleteReport = async (req, res, next) => {
  try {
    const report = req.report;
    await report.destroy();
    res.status(204).send();
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};