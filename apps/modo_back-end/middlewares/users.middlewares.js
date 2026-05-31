/*
  Purpose: Validation and authentication middleware for user routes.
  Exposes payload validators for user creation and login, parameter
  validators, JWT-based authentication, and an admin authorization
  guard.
*/

import jwt from "jsonwebtoken";
import { User } from "../config/db.config.js";

/**
 * validateCreateUser(req, res, next)
 * Validates the payload when creating a new user. Ensures `nome`,
 * `email` and `password` meet format and complexity requirements.
 * Responds with HTTP 400 and error details on failure.
 */
export const validateCreateUser = (req, res, next) => {
  const { nome, email, password } = req.body;
  const errors = {};

  if (!nome || typeof nome !== "string" || nome.trim() === "") {
    errors.nome = ["Name is mandatory."];
  }

  if (!email || typeof email !== "string" || email.trim() === "") {
    errors.email = ["Email is mandatory."];
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = ["Email must be a valid email address."];
  }

  if (!password || typeof password !== "string" || password.trim() === "") {
    errors.password = errors.password || [];
    errors.password.push("Password is mandatory.");
  } else {
    if (password.length < 12 || password.length > 15) {
      errors.password = errors.password || [];
      errors.password.push("Password must be between 12 and 15 characters.");
    }
    if (!/[A-Z]/.test(password)) {
      errors.password = errors.password || [];
      errors.password.push(
        "Password must contain at least one uppercase letter.",
      );
    }
    if (!/[a-z]/.test(password)) {
      errors.password = errors.password || [];
      errors.password.push(
        "Password must contain at least one lowercase letter.",
      );
    }
    if (!/[0-9]/.test(password)) {
      errors.password = errors.password || [];
      errors.password.push("Password must contain at least one digit.");
    }
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      errors.password = errors.password || [];
      errors.password.push(
        "Password must contain at least one special character.",
      );
    }
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
 * validateLoginUser(req, res, next)
 * Validates that `email` and `password` are present in a login
 * request. Responds with HTTP 400 with details when missing.
 */
export const validateLoginUser = (req, res, next) => {
  const { email, password } = req.body;
  const errors = {};

  if (!email) {
    errors.email = ["Email is mandatory."];
  }

  if (!password) {
    errors.password = ["Password is mandatory."];
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
 * validateUserId(req, res, next)
 * Ensures that the `userId` route parameter is a positive integer.
 * Responds with HTTP 400 when invalid.
 */
export const validateUserId = (req, res, next) => {
  const { userId } = req.params;

  if (!Number.isInteger(Number(userId)) || Number(userId) <= 0) {
    return res.status(400).json({
      description: "Invalid request.",
      errors: { userId: ["Invalid user ID format."] },
    });
  }
  next();
};

/**
 * authenticateUser(req, res, next)
 * Verifies a JWT provided in the `Authorization` header (Bearer or
 * raw token). On success, attaches the decoded token to `req.user`.
 * Returns 401 when the token is missing or invalid.
 */
export const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      description: "Missing or invalid authentication token",
      errors: { token: ["Authentication token is required."] },
    });
  }

  try {
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;
    const jwtSecret = process.env.JWT_SECRET || "dev_secret";
    if (!process.env.JWT_SECRET)
      console.warn(
        "Warning: JWT_SECRET not set, using dev_secret (not for production)",
      );

    const decoded = jwt.verify(token, jwtSecret);

    // Load full user instance from DB so controllers can use user.toJSON(), etc.
    const userInstance = await User.findByPk(decoded.id);
    if (!userInstance) {
      return res.status(401).json({ description: "Invalid token." });
    }

    req.user = userInstance; // attach model instance

    next();
  } catch (err) {
    return res.status(401).json({
      description: "Invalid token.",
    });
  }
};

/**
 * authorizeAdmin(req, res, next)
 * Authorization middleware that checks `req.user.tipo_utilizador`
 * and returns 403 if the user is not an admin. Call this after
 * `authenticateUser`.
 */
export const authorizeAdmin = (req, res, next) => {
  const role =
    (req.user &&
      (req.user.tipo_utilizador || req.user.dataValues?.tipo_utilizador)) ||
    "";
  if (!req.user || role.toLowerCase() !== "admin") {
    return res.status(403).json({
      description: "Forbidden.",
      errors: { access: ["You do not have permission."] },
    });
  }
  next();
};

/**
 * authorizeOwnerOrAdmin(req, res, next)
 * Allows access if the authenticated user is the target user (owner)
 * or if they have admin role. Expects a `userId` route param.
 */
export const authorizeOwnerOrAdmin = (req, res, next) => {
  const requester = req.user;
  const requesterRole = (
    (requester &&
      (requester.tipo_utilizador || requester.dataValues?.tipo_utilizador)) ||
    ""
  ).toLowerCase();
  const requesterId =
    requester &&
    (requester.id_utilizador || requester.dataValues?.id_utilizador);
  const { userId } = req.params;

  if (requesterRole === "admin") return next();

  if (!requesterId || !userId || Number(requesterId) !== Number(userId)) {
    return res.status(403).json({
      description: "Forbidden.",
      errors: { access: ["You do not have permission."] },
    });
  }

  next();
};
