import jwt from "jsonwebtoken";
import { User } from "../config/db.config.js";

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

export const authenticateUser = (req, res, next) => {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // 🔥 important

    next();
  } catch (err) {
    return res.status(401).json({
      description: "Invalid token.",
    });
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.tipo_utilizador !== "admin") {
    return res.status(403).json({
      description: "Forbidden.",
      errors: { access: ["You do not have permission."] },
    });
  }
  next();
};
