/*
  Purpose: Controllers for user management: create, read, update,
  delete, authentication (login) and user-habit assignment. Each
  controller returns JSON responses enriched with HATEOAS links and
  forwards errors via `next()`.
*/

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cloudinary from "../config/cloudinary.config.js";
// Import users data
import { User, Habit } from "../config/db.config.js";
import { Op } from "sequelize";
import {
  validationError,
  forbiddenError,
  notFoundError,
  conflictError,
  genericError,
  unauthorizedError,
  sequelizeValidationError,
} from "../utils/errors.utils.js";

const getUploadedFileUrl = (file) => file?.path || file?.secure_url || null;

/**
 * createUser(req, res, next)
 * Creates a new user record using `nome`, `email`, `password`, and
 * `tipo_utilizador` from the request body. Returns the created user
 * (HTTP 201) with HATEOAS links. Handles validation (400) and
 * unique constraint (409) errors by forwarding them to `next()`.
 */
// Controller to create a new user
export const createUser = async (req, res, next) => {
  try {
    const {
      nome,
      email,
      password,
      pontos,
      nivel,
      data_criacao,
      tipo_utilizador,
    } = req.body;

    const roleMap = { cliente: "Client", client: "Client", admin: "Admin" };
    const mappedRole = tipo_utilizador
      ? roleMap[tipo_utilizador.toLowerCase()] || tipo_utilizador
      : undefined;

    const hashed = await bcrypt.hash(password, 10);

    // Get Cloudinary URL if file was uploaded
    const imagem_utilizador = getUploadedFileUrl(req.file);

    const payload = {
      nome,
      email,
      hashed_password: hashed,
      pontos,
      nivel,
      data_criacao_conta: data_criacao,
      tipo_utilizador: mappedRole,
      imagem_utilizador: imagem_utilizador,
    };

    // Create user using model column names
    const user = await User.create(payload);

    // Include HATEOAS links in the response
    const response = {
      ...user.toJSON(),
      links: [
        { rel: "login", method: "POST", href: "/users/login" },
        { rel: "self", method: "GET", href: `/users/${user.id_utilizador}` },
      ],
      message: "User registration was a success!",
    };
    // Also sign a token and return it (auto-login on registration)
    const jwtSecret = process.env.JWT_SECRET || "dev_secret";
    if (!process.env.JWT_SECRET)
      console.warn(
        "Warning: JWT_SECRET not set, using dev_secret (not for production)",
      );

    const token = jwt.sign(
      {
        id: user.id_utilizador,
        tipo_utilizador: (user.tipo_utilizador || "").toLowerCase(),
      },
      jwtSecret,
    );

    res.status(201).json({ token, ...response });
  } catch (error) {
    console.error(error);
    // Handle specific errors: 400, 409 and 500
    if (error.name === "SequelizeValidationError") {
      return next(sequelizeValidationError(error.errors));
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      return next(
        conflictError({ email: ["A user with this email already exists."] }),
      );
    }

    return next(genericError());
  }
};

/**
 * getAllUsers(req, res, next)
 * Retrieves all users (pagination/filtering TODO) and returns them
 * with HATEOAS `self` links. Forwards internal errors (500) via
 * `next()`.
 */
// Controller to get all users
export const getAllUsers = async (req, res, next) => {
  const {
    page = 1,
    limit = 5,
    role,
    sort = "id_utilizador",
    order = "ASC",
    q,
  } = req.query;

  try {
    const parsedPage = Math.max(Number(page) || 1, 1);
    const parsedLimit = Math.min(Math.max(Number(limit) || 5, 1), 100);
    const offset = (parsedPage - 1) * parsedLimit;

    const safeSortFields = new Set([
      "id_utilizador",
      "nome",
      "email",
      "nivel",
      "pontos",
      "data_criacao_conta",
    ]);
    const sortField = safeSortFields.has(sort) ? sort : "id_utilizador";
    const sortOrder = String(order).toUpperCase() === "DESC" ? "DESC" : "ASC";

    const where = {};
    if (role) where.tipo_utilizador = role;
    if (q) {
      where[Op.or] = [
        { nome: { [Op.like]: `%${q}%` } },
        { email: { [Op.like]: `%${q}%` } },
      ];
    }

    const { rows, count } = await User.findAndCountAll({
      where,
      order: [[sortField, sortOrder]],
      limit: parsedLimit,
      offset,
    });

    const response = rows.map((user) => ({
      ...user.toJSON(),
      links: [
        { rel: "self", method: "GET", href: `/users/${user.id_utilizador}` },
      ],
    }));

    res
      .status(200)
      .json({
        meta: {
          total: count,
          page: parsedPage,
          limit: parsedLimit,
          pages: Math.ceil(count / parsedLimit),
        },
        data: response,
      });
  } catch (error) {
    return next(genericError());
  }
};

/**
 * getUserById(req, res, next)
 * Returns a single user attached to `req.user` by earlier middleware.
 * If missing, forwards a 404. Adds a HATEOAS `self` link to the
 * response.
 */
// Controller to get a user by ID
export const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    // requester is attached by authenticateUser as a model instance
    const requester = req.user;

    // load target user by id param
    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      return next(notFoundError("User", userId));
    }

    // authorization: allow if requester is admin or requester is the same user
    const requesterRole =
      requester &&
      (requester.tipo_utilizador || requester.dataValues?.tipo_utilizador)
        ? String(
            requester.tipo_utilizador || requester.dataValues?.tipo_utilizador,
          ).toLowerCase()
        : "";

    const requesterId =
      requester &&
      (requester.id_utilizador || requester.dataValues?.id_utilizador);

    if (requesterRole !== "admin" && Number(requesterId) !== Number(userId)) {
      return next(forbiddenError());
    }

    // Prevent modifying another admin: admins may not modify/delete other admins
    const targetRole = (
      targetUser.tipo_utilizador ||
      targetUser.dataValues?.tipo_utilizador ||
      ""
    ).toLowerCase();
    if (targetRole === "admin" && Number(requesterId) !== Number(userId)) {
      return next(forbiddenError("Forbidden. Cannot modify another admin."));
    }

    // Include HATEOAS links in the response
    const response = {
      ...targetUser.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/users/${targetUser.id_utilizador}`,
        },
      ],
    };
    res.status(200).json(response);
  } catch (error) {
    // Handle specific errors: 500
    return next(genericError());
  }
};

/**
 * updateUser(req, res, next)
 * Updates `email` and/or `password` on the user instance found at
 * `req.user`. Returns the updated resource with a `self` link. Handles
 * unique email conflicts (409) and internal errors.
 */
// Controller to update a user
export const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { email, password, nome } = req.body;
    const requester = req.user; // authenticated requester

    // load target user by id param
    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      return next(notFoundError("User", userId));
    }

    // authorization: allow if requester is admin or requester is the same user
    const requesterRole =
      requester &&
      (requester.tipo_utilizador || requester.dataValues?.tipo_utilizador)
        ? String(
            requester.tipo_utilizador || requester.dataValues?.tipo_utilizador,
          ).toLowerCase()
        : "";

    const requesterId =
      requester &&
      (requester.id_utilizador || requester.dataValues?.id_utilizador);

    if (requesterRole !== "admin" && Number(requesterId) !== Number(userId)) {
      return next(forbiddenError());
    }

    const updates = {};
    if (email !== undefined) updates.email = email;
    if (password !== undefined)
      updates.hashed_password = await bcrypt.hash(password, 10);
    if (nome !== undefined) updates.nome = nome;
    // Handle profile picture update if file was uploaded
    if (req.file) {
      updates.imagem_utilizador = getUploadedFileUrl(req.file);
    }

    // If a profile image was uploaded as multipart/form-data (field: imagem_utilizador), upload to Cloudinary
    if (req.file && req.file.buffer) {
      const { Readable } = await import("stream");
      const uploadFromBuffer = (buffer) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "Modo/user-profiles" },
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
        updates.imagem_utilizador = uploaded?.secure_url;
      } catch (err) {
        return next(genericError("Failed to upload profile image."));
      }
    }

    await targetUser.update(updates);

    // Prevent modifying another admin: admins may not modify/delete other admins
    const targetRole = (
      targetUser.tipo_utilizador ||
      targetUser.dataValues?.tipo_utilizador ||
      ""
    ).toLowerCase();
    if (targetRole === "admin" && Number(requesterId) !== Number(userId)) {
      return next(forbiddenError("Forbidden. Cannot modify another admin."));
    }

    // Include HATEOAS links in the response
    const response = {
      ...targetUser.toJSON(),
      links: [
        {
          rel: "self",
          method: "GET",
          href: `/users/${targetUser.id_utilizador}`,
        },
      ],
    };
    res.status(200).json(response);
  } catch (error) {
    // Handle specific errors: 409 and 500
    if (error.name === "SequelizeUniqueConstraintError") {
      return next(
        conflictError({ email: ["A user with this email already exists."] }),
      );
    }
    return next(genericError());
  }
};

/**
 * deleteUser(req, res, next)
 * Deletes the user attached to `req.user`. Responds 204 on success or
 * forwards a 404 if the user does not exist.
 */
// Controller to delete a user
export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const requester = req.user;

    // load target user by id param
    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      return next(notFoundError("User", userId));
    }

    // authorization: allow if requester is admin or requester is the same user
    const requesterRole =
      requester &&
      (requester.tipo_utilizador || requester.dataValues?.tipo_utilizador)
        ? String(
            requester.tipo_utilizador || requester.dataValues?.tipo_utilizador,
          ).toLowerCase()
        : "";

    const requesterId =
      requester &&
      (requester.id_utilizador || requester.dataValues?.id_utilizador);

    if (requesterRole !== "admin" && Number(requesterId) !== Number(userId)) {
      return next(forbiddenError());
    }
    // Prevent deleting another admin
    const targetRoleDel = (
      targetUser.tipo_utilizador ||
      targetUser.dataValues?.tipo_utilizador ||
      ""
    ).toLowerCase();
    if (targetRoleDel === "admin" && Number(requesterId) !== Number(userId)) {
      return next(forbiddenError("Forbidden. Cannot delete another admin."));
    }

    await targetUser.destroy();
    res.status(204).send();
  } catch (error) {
    // Handle specific errors: 500
    return next(genericError());
  }
};

/**
 * loginUser(req, res, next)
 * Authenticates a user by `email` and `password`. On success signs a
 * JWT and returns it alongside the user object and HATEOAS links.
 * Returns 401 on invalid credentials and 500 on internal errors.
 */
// Controller to login a user
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return next(unauthorizedError("Invalid credentials."));
    }

    const match = await bcrypt.compare(password, user.hashed_password);
    if (!match) {
      return next(unauthorizedError("Invalid credentials."));
    }

    const jwtSecret = process.env.JWT_SECRET || "dev_secret";
    if (!process.env.JWT_SECRET)
      console.warn(
        "Warning: JWT_SECRET not set, using dev_secret (not for production)",
      );

    const token = jwt.sign(
      {
        id: user.id_utilizador,
        tipo_utilizador: (user.tipo_utilizador || "").toLowerCase(),
      },
      jwtSecret,
    );

    // Return the requested success message plus the JWT token and role
    res.status(200).json({
      message: "User login was a success!",
      token,
      role: (user.tipo_utilizador || "").toLowerCase(),
    });
  } catch (error) {
    // Handle specific errors: 500
    return next(genericError());
  }
};

/**
 * assignTaskToUser(req, res, next)
 * Associates a habit with a user. Validates presence of the user and
 * the habit, attaches the habit to the user via ORM helpers and
 * returns the updated user with links. Forwards 404 or 500 on error.
 */
// Controller to assign a task to a user
export const assignTaskToUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    // Accept either `habitId` (API) or `id_habito` (model) in the body
    const habitId = req.body.habitId ?? req.body.id_habito;
    const requester = req.user;

    // load target user by id param
    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      return next(notFoundError("User", userId));
    }

    // authorization: allow if requester is admin or requester is the same user
    const requesterRole =
      requester &&
      (requester.tipo_utilizador || requester.dataValues?.tipo_utilizador)
        ? String(
            requester.tipo_utilizador || requester.dataValues?.tipo_utilizador,
          ).toLowerCase()
        : "";

    const requesterId =
      requester &&
      (requester.id_utilizador || requester.dataValues?.id_utilizador);

    if (requesterRole !== "admin" && Number(requesterId) !== Number(userId)) {
      return next(forbiddenError());
    }

    const habit = await Habit.findByPk(habitId);
    if (!habit) {
      return next(notFoundError("Habit", habitId));
    }

    // If Sequelize association exists this will link them; otherwise skip with a warning
    if (typeof targetUser.addHabit === "function") {
      await targetUser.addHabit(habit);
    }

    // Include HATEOAS links in the response
    const response = {
      ...targetUser.toJSON(),
      links: [
        {
          rel: "self",
          method: "POST",
          href: `/users/${userId}/habits/${habitId}`,
        },
        {
          rel: "user_habits",
          method: "GET",
          href: `/users/${userId}/habits`,
        },
      ],
    };
    res.status(200).json(response);
  } catch (error) {
    // Handle specific errors: 500
    return next(genericError());
  }
};
