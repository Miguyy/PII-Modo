/*
  Purpose: HTTP controller handlers for the Decoration resource.
  Exports functions to list, create, read, update, and delete decorations.
  Each controller responds with HATEOAS links and forwards errors via `next()`.
  Includes protections against Mass Assignment by destructuring req.body.
*/

import { AvatarDecoration } from "../config/db.config.js";
import { UserDecorations } from "../config/db.config.js";
import cloudinary from "../config/cloudinary.config.js";

/**
 * getAllDecorations(req, res, next)
 * Retrieves all decorations from the database.
 */
export const getAllDecorations = async (req, res, next) => {
  try {
    const decorations = await AvatarDecoration.findAll();

    const response = decorations.map((decoration) => ({
      ...decoration.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/avatar-decorations/${decoration.id_decoracao}`,
        },
      ],
    }));

    res.status(200).json(response);
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};

/**
 * createDecoration(req, res, next)
 * Creates a new Decoration. Returns HTTP 201 with a `self` HATEOAS link.
 */
export const createDecoration = async (req, res, next) => {
  try {
    // Security Protection: Extract only the allowed fields
    const { nome_decoracao, nivel_necessario } = req.body;

    let caminho_decoracao = req.body.caminho_decoracao;
    if (req.file && req.file.buffer) {
      const { Readable } = await import("stream");
      const uploadFromBuffer = (buffer) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "avatar_decorations" },
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
        caminho_decoracao = uploaded?.secure_url ?? caminho_decoracao;
      } catch (err) {
        return next({
          status: 500,
          message: "Failed to upload decoration file.",
        });
      }
    }

    const decoration = await AvatarDecoration.create({
      nome_decoracao,
      nivel_necessario,
      caminho_decoracao,
    });

    res.status(201).json({
      ...decoration.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/avatar-decorations/${decoration.id_decoracao}`,
        },
      ],
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return next({
        status: 409,
        message: "Resource conflict.",
        errors: {
          nome_decoracao: ["A decoration with this name already exists."],
        },
      });
    }
    return next({ status: 500, message: "Internal server error." });
  }
};

/**
 * getDecorationById(req, res, next)
 * Returns the decoration attached to `req.decoration` by middleware.
 */
/* export const getDecorationById = async (req, res, next) => {
  try {
    const decoration = req.decoration;

    res.status(200).json({
      ...decoration.toJSON(),
      links: [
        { rel: "self", method: "GET", href: `/decorations/${decoration.id}` },
      ],
    });
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
}; */

/**
 * updateDecoration(req, res, next)
 * Updates the decoration instance available at `req.decoration`.
 */
export const updateDecoration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const decoration = await AvatarDecoration.findByPk(id);

    if (!decoration) {
      return res.status(404).json({
        description: "Resource not found.",
        errors: { id: ["Decoration not found."] },
      });
    }

    // Security Protection: Extract only the allowed fields for update
    const { nome_decoracao, nivel_necessario } = req.body;

    // Log incoming file and body for debugging when users report upload failures
    if (req.file) {
      // eslint-disable-next-line no-console
      console.log("updateDecoration: req.file present:", {
        fieldname: req.file.fieldname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        originalname: req.file.originalname,
      });
    } else {
      // eslint-disable-next-line no-console
      console.log("updateDecoration: no req.file provided");
    }

    // Determine new caminho_decoracao: prefer uploaded file if present
    let newCaminho = req.body.caminho_decoracao ?? decoration.caminho_decoracao;

    if (req.file && req.file.buffer) {
      const { Readable } = await import("stream");
      const uploadFromBuffer = (buffer) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "Modo/Decorations" },
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
        if (uploaded && uploaded.secure_url) {
          newCaminho = uploaded.secure_url;
        }
      } catch (err) {
        // upload failed: log and return error
        // eslint-disable-next-line no-console
        console.error("Cloudinary upload failed in updateDecoration:", err);
        return next({
          status: 500,
          message: "Failed to upload decoration file.",
        });
      }
    }

    const updated = await decoration.update({
      nome_decoracao: nome_decoracao ?? decoration.nome_decoracao,
      nivel_necessario: nivel_necessario ?? decoration.nivel_necessario,
      caminho_decoracao: newCaminho,
    });

    res.status(200).json({
      ...updated.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/avatar-decorations/${decoration.id_decoracao}`,
        },
      ],
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return next({
        status: 409,
        message: "Resource conflict.",
        errors: {
          nome_decoracao: ["A decoration with this name already exists."],
        },
      });
    }
    return next({ status: 500, message: "Internal server error." });
  }
};

/**
 * deleteDecoration(req, res, next)
 * Deletes the decoration attached to `req.decoration`.
 */
export const deleteDecoration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const decoration = await AvatarDecoration.findByPk(id);

    if (!decoration) {
      return res.status(404).json({
        description: "Resource not found.",
        errors: { id: ["Decoration not found."] },
      });
    }

    // remove associations in join table first
    await UserDecorations.destroy({
      where: { id_decoracao: decoration.id_decoracao },
    });
    await decoration.destroy();
    res.status(204).send();
  } catch (error) {
    return next({ status: 500, message: "Internal server error." });
  }
};
