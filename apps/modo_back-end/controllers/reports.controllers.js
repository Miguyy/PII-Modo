/*
  Purpose: HTTP controllers for Reports generation and retrieval.
  Includes protections against Mass Assignment by destructuring req.body.
*/

import { Report } from "../config/db.config.js";
import cloudinary from "../config/cloudinary.config.js";

/**
 * getAllReports(req, res, next)
 * Retrieves all reports from the database.
 */
export const getAllReports = async (req, res, next) => {
  try {
    // If no user filter provided, only admin can access all reports
    const requester = req.user;
    const requesterRole = (
      (requester &&
        (requester.tipo_utilizador || requester.dataValues?.tipo_utilizador)) ||
      ""
    ).toLowerCase();
    const { userId } = req.query;
    if (!userId && requesterRole !== "admin")
      return next({ status: 403, message: "Forbidden." });

    const where = userId ? { id_utilizador: Number(userId) } : {};
    const reports = await Report.findAll({ where });

    const response = reports.map((report) => ({
      ...report.toJSON(),
      links: [
        { rel: "self", method: "GET", href: `/reports/${report.id_relatorio}` },
      ],
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
    const { mes, semana, data_geracao, conteudo } = req.body;
    const { userId } = req.params;

    // If a file was uploaded (multipart/form-data), upload to Cloudinary
    let caminho_relatorio = req.body.caminho_relatorio;
    if (req.file && req.file.buffer) {
      const { Readable } = await import("stream");
      const uploadFromBuffer = (buffer) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "Modo/Reports" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            },
          );

          const readable = new Readable();
          readable._read = () => {};
          readable.push(buffer);
          readable.push(null);
          readable.pipe(stream);
        });

      try {
        const uploaded = await uploadFromBuffer(req.file.buffer);
        caminho_relatorio = uploaded?.secure_url ?? caminho_relatorio;
      } catch (err) {
        return next({ status: 500, message: "Failed to upload report file." });
      }
    }

    // Authorization: only admin or the user themself may create a report for a user
    const requester = req.user;
    const requesterRole = (
      (requester &&
        (requester.tipo_utilizador || requester.dataValues?.tipo_utilizador)) ||
      ""
    ).toLowerCase();
    if (
      requesterRole !== "admin" &&
      Number(requester.id_utilizador || requester.dataValues?.id_utilizador) !==
        Number(userId)
    ) {
      return next({ status: 403, message: "Forbidden." });
    }

    // create report using model column names
    const report = await Report.create({
      id_utilizador: userId,
      mes,
      semana,
      data_geracao: data_geracao ?? undefined,
      conteudo,
      caminho_relatorio,
    });

    res.status(201).json({
      ...report.toJSON(),
      links: [
        { rel: "self", method: "GET", href: `/reports/${report.id_relatorio}` },
      ],
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      return next({
        status: 400,
        message: "Validation failed.",
        errors: { message: [error.message] },
      });
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      return next({
        status: 409,
        message: "Resource conflict.",
        errors: {
          report: ["A report for this specific period already exists."],
        },
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

    // Authorization: only admin or owner may fetch this report
    const requester = req.user;
    const requesterRole = (
      (requester &&
        (requester.tipo_utilizador || requester.dataValues?.tipo_utilizador)) ||
      ""
    ).toLowerCase();
    const requesterId =
      requester &&
      (requester.id_utilizador || requester.dataValues?.id_utilizador);
    if (
      requesterRole !== "admin" &&
      Number(requesterId) !== Number(report.id_utilizador)
    )
      return next({ status: 403, message: "Forbidden." });

    res.status(200).json({
      ...report.toJSON(),
      links: [
        { rel: "self", method: "GET", href: `/reports/${report.id_relatorio}` },
      ],
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
    if (!report) return next({ status: 404, message: "Report not found." });
    await report.destroy();
    res.status(204).send();
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};
