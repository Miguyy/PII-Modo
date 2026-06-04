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
import {
  User,
  Habit,
  UserDecorations,
  AvatarDecoration,
  Notification,
} from "../config/db.config.js";
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

const normalizeDecorationPath = (decoration) => {
  if (!decoration) return null;
  if (decoration.caminho_decoracao) return decoration.caminho_decoracao;

  const decorationName = decoration.nome_decoracao || decoration.name;
  return decorationName
    ? `/src/images/avatar_decoration/${decorationName}.png`
    : null;
};

const resolveCurrentDecoration = async (userId) => {
  const userDecoration = await UserDecorations.findOne({
    where: { id_utilizador: Number(userId) },
  });

  if (!userDecoration || !userDecoration.id_decoracao) {
    return null;
  }

  const decoration = await AvatarDecoration.findByPk(userDecoration.id_decoracao);
  return {
    path: normalizeDecorationPath(decoration),
    name: decoration?.nome_decoracao || decoration?.name || null,
  };
};

const resolveDecorationId = async (value) => {
  if (value === null || value === undefined || value === "" || value === "null") {
    return null;
  }

  const numericValue = Number(value);
  if (Number.isInteger(numericValue) && numericValue > 0) {
    return numericValue;
  }

  const rawValue = String(value);
  const baseName = rawValue.split("/").pop()?.replace(/\.[^.]+$/, "") || rawValue;
  const decoration = await AvatarDecoration.findOne({
    where: {
      [Op.or]: [
        { nome_decoracao: rawValue },
        { nome_decoracao: baseName },
        { caminho_decoracao: rawValue },
      ],
    },
  });

  return decoration?.id_decoracao ?? null;
};

const applyDecorationUpdate = async (userId, value) => {
  if (value === undefined) return;

  const decorationId = await resolveDecorationId(value);
  const existing = await UserDecorations.findOne({
    where: { id_utilizador: Number(userId) },
  });

  if (existing) {
    await existing.update({ id_decoracao: decorationId });
    return;
  }

  await UserDecorations.create({
    id_utilizador: Number(userId),
    id_decoracao: decorationId,
  });
};

const buildUserResponse = async (user) => {
  const response = user.toJSON();
  const currentDecoration = await resolveCurrentDecoration(user.id_utilizador);
  response.avatarDecoration = currentDecoration?.path ?? null;
  response.avatarDecorationName = currentDecoration?.name ?? null;
  return {
    ...response,
    links: [
      {
        rel: "self",
        method: "GET",
        href: `/users/${user.id_utilizador}`,
      },
    ],
  };
};

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
    let mappedRole = tipo_utilizador
      ? roleMap[tipo_utilizador.toLowerCase()] || tipo_utilizador
      : undefined;

    // If the request is unauthenticated or requester is not admin,
    // force any new registration to be a Client. Admins (authenticated)
    // may create users with elevated roles.
    const requester = req.user;
    const requesterRole = requester
      ? String(
          requester.tipo_utilizador || requester.dataValues?.tipo_utilizador,
        ).toLowerCase()
      : "";
    if (!requester || requesterRole !== "admin") {
      mappedRole = "Client";
    }

    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : email;
    const hashed = await bcrypt.hash(password, 10);

    // Get Cloudinary URL if file was uploaded
    const imagem_utilizador = getUploadedFileUrl(req.file);

    const payload = {
      nome,
      email: normalizedEmail,
      hashed_password: hashed,
      pontos,
      nivel,
      data_criacao_conta: data_criacao,
      tipo_utilizador: mappedRole,
      imagem_utilizador: imagem_utilizador,
    };

    // Create user using model column names
    const user = await User.create(payload);

    console.log(`[ADMIN ACTION] User ${requester ? (requester.id_utilizador || requester.dataValues?.id_utilizador) : 'Unknown Admin'} CREATED new User: ${email} (ID: ${user.id_utilizador})`);

    // Include HATEOAS links in the response
    const response = {
      ...user.toJSON(),
      links: [
        { rel: "login", method: "POST", href: "/users/login" },
        { rel: "self", method: "GET", href: `/users/${user.id_utilizador}` },
      ],
      message: "User registration was a success!",
    };
    // Auto-sign a token only for self-registration (unauthenticated
    // requests). If an admin created the user we do not return a token.
    if (!requester) {
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

      return res.status(201).json({ token, ...response });
    }

    // Admin-created user: return created resource without auto-login
    res.status(201).json(response);
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

    res.status(200).json({
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
    res.status(200).json(await buildUserResponse(targetUser));
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
    const {
      email,
      password,
      nome,
      avatar,
      imagem_utilizador: imageFromBody,
      avatarDecoration,
      id_decoracao,
      pontos,
    } = req.body;
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
    // Handle role change rules: only admins may promote a Client -> Admin.
    if (
      req.body &&
      Object.prototype.hasOwnProperty.call(req.body, "tipo_utilizador")
    ) {
      const requested = req.body.tipo_utilizador;
      const roleMap = { cliente: "Client", client: "Client", admin: "Admin" };
      const requestedRole = requested
        ? roleMap[requested.toLowerCase()] || requested
        : undefined;

      const targetCurrentRole = (
        targetUser.tipo_utilizador ||
        targetUser.dataValues?.tipo_utilizador ||
        ""
      ).toLowerCase();

      // Prevent modifying another admin at all
      if (
        targetCurrentRole === "admin" &&
        Number(requesterId) !== Number(userId)
      ) {
        return next(forbiddenError("Forbidden. Cannot modify another admin."));
      }

      // If attempting to change role
      if (requestedRole && requestedRole !== targetUser.tipo_utilizador) {
        // Only allow promoting a client to admin and only by an admin requester
        if (
          requestedRole === "Admin" &&
          targetCurrentRole === "client" &&
          requesterRole === "admin"
        ) {
          updates.tipo_utilizador = requestedRole;
        } else {
          return next(forbiddenError("Forbidden. Role change not permitted."));
        }
      }
    }
    if (email !== undefined) updates.email = email;
    if (password !== undefined)
      updates.hashed_password = await bcrypt.hash(password, 10);
    if (nome !== undefined) updates.nome = nome;
    if (pontos !== undefined && requesterRole === "admin") {
      updates.pontos = Number(pontos);
      updates.nivel = Math.floor(updates.pontos / 100);
    }
    if (avatar !== undefined) updates.imagem_utilizador = avatar;
    if (imageFromBody !== undefined)
      updates.imagem_utilizador = imageFromBody;
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

    const oldNivel = targetUser.nivel || 0;
    await targetUser.update(updates);
    
    if (updates.nivel && updates.nivel > oldNivel) {
      await Notification.create({
        id_utilizador: targetUser.id_utilizador,
        tipo_notificacao: 'Level',
        mensagem: `Congratulations! You've leveled up to Level ${updates.nivel}!`,
      });
      
      const unlockedDecorations = await AvatarDecoration.findAll({
        where: {
          nivel_necessario: {
            [Op.gt]: oldNivel,
            [Op.lte]: updates.nivel
          }
        }
      });
      
      for (const dec of unlockedDecorations) {
        await Notification.create({
          id_utilizador: targetUser.id_utilizador,
          tipo_notificacao: 'Avatar',
          mensagem: `Congratulations! You've unlocked the "${dec.nome_decoracao}" avatar decoration!`,
        });
      }
    }
    if (avatarDecoration !== undefined || id_decoracao !== undefined) {
      await applyDecorationUpdate(
        userId,
        id_decoracao !== undefined ? id_decoracao : avatarDecoration,
      );
    }

    console.log(`[ADMIN ACTION] User ${requesterId || 'Unknown Admin'} UPDATED User ID: ${userId}`);

    // Include HATEOAS links in the response
    res.status(200).json(await buildUserResponse(targetUser));
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

    // Remove dependent records that belong to the user so foreign
    // key constraints won't prevent deletion. This explicitly removes
    // user assignments, decorations, notifications, reports and
    // locations. The database relationships are already defined with
    // CASCADE but we ensure removal here to satisfy the NOTE that
    // active tasks/habits/decorations/notifications should not block
    // deletion.
    const { UserTasks, UserDecorations, Notification, Report, Location } =
      await import("../config/db.config.js");

    await Promise.all([
      UserTasks.destroy({ where: { id_utilizador: Number(userId) } }),
      UserDecorations.destroy({ where: { id_utilizador: Number(userId) } }),
      Notification.destroy({ where: { id_utilizador: Number(userId) } }),
      Report.destroy({ where: { id_utilizador: Number(userId) } }),
      Location.destroy({ where: { id_utilizador: Number(userId) } }),
    ]);

    // Finally remove the user record itself
    await targetUser.destroy();

    console.log(`[ADMIN ACTION] User ${requesterId || 'Unknown Admin'} DELETED User ID: ${userId}`);

    res.status(204).send();
  } catch (error) {
    // Handle specific errors: 500
    return next(genericError());
  }
};

/**
 * forgotPassword(req, res, next)
 * Generates a short-lived reset token for the provided email. In a
 * production system this would be emailed to the user; for now we
 * return the token in the response for development/testing.
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body || {};
    if (!email) return next(validationError({ email: ["Email is required"] }));

    const user = await User.findOne({ where: { email } });

    // Always return success to avoid leaking whether an email exists
    if (!user) {
      return res
        .status(200)
        .json({ message: "If the email exists, a reset token was issued." });
    }

    const jwtSecret = process.env.JWT_SECRET || "dev_secret";
    const token = jwt.sign(
      { id: user.id_utilizador, purpose: "reset" },
      jwtSecret,
      { expiresIn: "1h" },
    );

    // TODO: send token via email; return token for now
    res.status(200).json({ message: "Reset token generated.", token });
  } catch (error) {
    return next(genericError());
  }
};

// NOTE: token verification endpoint removed; `resetPassword` now
// accepts the token either in the request body (`token`) or as a
// route param (`/forgot-password/:token`) and performs the reset.

/**
 * resetPassword(req, res, next)
 * Accepts `{ token, password }` in the body, verifies the token and
 * updates the user's password.
 */
export const resetPassword = async (req, res, next) => {
  try {
    const token = (req.body && req.body.token) || req.params.token;
    const { password } = req.body || {};

    if (!token || !password)
      return next(
        validationError({ token: ["Token and password are required"] }),
      );

    const jwtSecret = process.env.JWT_SECRET || "dev_secret";
    let payload;
    try {
      payload = jwt.verify(token, jwtSecret);
    } catch (err) {
      return next(unauthorizedError("Invalid or expired token."));
    }

    if (payload.purpose !== "reset")
      return next(validationError({ token: ["Invalid token purpose"] }));

    const user = await User.findByPk(payload.id);
    if (!user) return next(notFoundError("User", payload.id));

    const hashed = await bcrypt.hash(password, 10);
    await user.update({ hashed_password: hashed });

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    return next(genericError());
  }
};

/**
 * logout(req, res)
 * Stateless JWT logout - instruct client to discard token. We return
 * success; persistent token revocation is out-of-scope for now.
 */
export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res.status(200).json({ message: "Logged out." });
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
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : email;
    const user = await User.findOne({ where: { email: normalizedEmail } });

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

    // After token is created
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // adjust to strict if needed
      maxAge: 15 * 60 * 1000, // 15 minutes
    };

    res.cookie("token", token, cookieOptions);
    // Return cookie plus a single JSON response that includes the token
    const currentDecoration = await resolveCurrentDecoration(user.id_utilizador);

    return res.status(200).json({
      message: "User login was a success!",
      token,
      id_utilizador: user.id_utilizador,
      role: (user.tipo_utilizador || "").toLowerCase(),
      avatarDecoration: currentDecoration?.path ?? null,
      avatarDecorationName: currentDecoration?.name ?? null,
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
