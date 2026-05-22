/*
  Purpose: Validation and existence-check middleware for Report endpoints.
*/

import { Report } from "../config/db.config.js";

/**
 * validateCreateReport(req, res, next)
 * Validates the request body when creating a Report.
 * Checks for mandatory `mes` and `semana` integers.
 */
export const validateCreateReport = (req, res, next) => {
  const { mes, semana } = req.body;
  const errors = {};

  if (mes === undefined || !Number.isInteger(Number(mes)) || Number(mes) < 1 || Number(mes) > 12) {
    errors.mes = ["Month is mandatory and must be an integer between 1 and 12."];
  }

  if (semana === undefined || !Number.isInteger(Number(semana)) || Number(semana) < 1 || Number(semana) > 5) {
    errors.semana = ["Week is mandatory and must be a valid integer."];
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
 * validateReportId(req, res, next)
 * Validates that the `reportId` route parameter is a positive integer.
 */
export const validateReportId = (req, res, next) => {
  const { reportId } = req.params;

  if (!Number.isInteger(Number(reportId)) || Number(reportId) <= 0) {
    return res.status(400).json({
      description: "Invalid request.",
      errors: { reportId: ["Invalid report ID format."] },
    });
  }
  next();
};

/**
 * checkReportExists(req, res, next)
 * Loads a Report by `reportId` and attaches it to `req.report`.
 */
export const checkReportExists = async (req, res, next) => {
  const { reportId } = req.params;
  const report = await Report.findByPk(reportId);

  if (!report) {
    return res.status(404).json({
      description: "Resource not found.",
      errors: { reportId: ["Report not found."] },
    });
  }

  req.report = report;
  next();
};