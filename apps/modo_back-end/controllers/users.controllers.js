// Import users data
import { User, Habit } from "../config/db.config.js";

// Controller to create a new user
export const createUser = async (req, res, next) => {
  try {
    const { nome, email, password, tipo_utilizador } = req.body;
    // Validate required fields and create user
    const user = await User.create({ nome, email, password, tipo_utilizador });

    // Include HATEOAS links in the response
    const response = {
      ...user.toJSON(),
      links: [
        { rel: "login", method: "POST", href: "/users/login" },
        { rel: "self", method: "GET", href: `/users/${user.id}` },
      ],
    };
    res.status(201).json(response);
  } catch (error) {
    // Handle specific errors: 400, 401, 403, 409 and 500
    if (error.name === "SequelizeValidationError") {
      const err = new Error("Validation failed.");
      err.status = 400;
      errors = error.errors.map((e) => {
        if (e.path === "email") {
          return ("Email is mandatory.", "Email must be valid.");
        }
        if (e.path === "password") {
          return (
            "Password is mandatory and must.",
            "Password must have between 12 and 15 characters. ",
            "Password must include uppercase, lowercase, numbers and special characters."
          );
        }
        return e.message;
      });
      err.errors = errors;
      return next(err);
    }
    if (error.name === "UnauthorizedError") {
      const err = new Error("Missing or invalid authentication token.");
      err.status = 401;
      return next(err);
    }
    if (error.name === "ForbiddenError") {
      const err = new Error("You do not have permission to create users.");
      err.status = 403;
      return next(err);
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      const err = new Error("Resource conflict.");
      err.status = 409;
      errors.errors.map((e) => {
        if (e.path === "email") {
          return "A user with this email already exists.";
        }
        return e.message;
      });
      err.errors = errors;
      return next(err);
    }

    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};

// Controller to get all users
export const getAllUsers = async (req, res, next) => {
  // Extract pagination and filtering parameters from query string
  const { page = 1, limit = 5, role = "admin" } = req.query;

  try {
    const users = await User.findAll();
    console.log(`Found ${users.length} users in the database.`);

    // Include HATEOAS links in the response
    const response = users.map((user) => ({
      ...user.toJSON(),
      links: [{ rel: "self", method: "GET", href: `/users/${user.id}` }],
    }));
    res.status(200).json(response);
  } catch (error) {
    // Handle specific errors: 401, 403 and 500
    if (error.name === "UnauthorizedError") {
      const err = new Error("Missing or invalid authentication token.");
      err.status = 401;
      return next(err);
    }
    if (error.name === "ForbiddenError") {
      const err = new Error(
        "You do not have permission to access this resource",
      );
      err.status = 403;
      return next(err);
    }

    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};

// Controller to get a user by ID
export const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) {
      const err = new Error("User not found.");
      err.status = 404;
      return next(err);
    }
    // Include HATEOAS links in the response
    const response = {
      ...user.toJSON(),
      links: [{ rel: "self", method: "GET", href: `/users/${user.id}` }],
    };
    res.status(200).json(user);
  } catch (error) {
    // Handle specific errors: 400, 401, 403, 404 and 500
    if (error.name === "BadRequestError") {
      const err = new Error("Invalid request.");
      err.status = 400;
      errors.errors.map((e) => {
        if (e.path === userId) {
          return "Invalid user ID format.";
        }
        return e.message;
      });
      err.errors = errors;
      return next(err);
    }
    if (error.name === "UnauthorizedError") {
      const err = new Error("Missing or invalid authentication token.");
      err.status = 401;
      return next(err);
    }
    if (error.name === "ForbiddenError") {
      const err = new Error(
        "You do not have permission to access this resource.",
      );
      err.status = 403;
      return next(err);
    }
    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};

// Controller to update a user
export const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { email, password } = req.body;
    const user = await User.findByPk(userId);
    if (!user) {
      const err = new Error("User not found.");
      err.status = 404;
      return next(err);
    }
    await user.update({ email, password });
    // Include HATEOAS links in the response
    const response = {
      ...user.toJSON(),
      links: [{ rel: "self", method: "GET", href: `/users/${user.id}` }],
    };
    res.status(200).json(response);
  } catch (error) {
    // Handle specific errors: 400, 401, 403, 404, 409 and 500
    if (error.name === "BadRequestError") {
      const err = new Error("Invalid request.");
      err.status = 400;
      errors.errors.map((e) => {
        if (e.path === "email") {
          return "Email must be valid.";
        }
        if (e.path === "password") {
          return "Password does not meet security requirements.";
        }
        return e.message;
      });
      err.errors = errors;
      return next(err);
    }
    if (error.name === "UnauthorizedError") {
      const err = new Error("Missing or invalid authentication token.");
      err.status = 401;
      return next(err);
    }
    if (error.name === "ForbiddenError") {
      const err = new Error(
        "You do not have permission to access this resource.",
      );
      err.status = 403;
      return next(err);
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      const err = new Error("Resource conflict.");
      err.status = 409;
      errors.errors.map((e) => {
        if (e.path === "email") {
          return "A user with this email already exists.";
        }
        return e.message;
      });
      err.errors = errors;
      return next(err);
    }
    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};

// Controller to delete a user
export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) {
      const err = new Error("User not found.");
      err.status = 404;
      return next(err);
    }
    await user.destroy();
    res.status(204).send();
  } catch (error) {
    // Handle specific errors: 400, 401, 403, 404 and 500
    if (error.name === "BadRequestError") {
      const err = new Error("Invalid request.");
      err.status = 400;
      errors.errors.map((e) => {
        if (e.path === userId) {
          return "Invalid user ID format.";
        }
        return e.message;
      });
      err.errors = errors;
      return next(err);
    }
    if (error.name === "UnauthorizedError") {
      const err = new Error("Missing or invalid authentication token.");
      err.status = 401;
      return next(err);
    }
    if (error.name === "ForbiddenError") {
      const err = new Error("You do not have permission to delete this user.");
      err.status = 403;
      return next(err);
    }
    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};

// Controller to login a user
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || user.password !== password) {
      const err = new Error("Invalid email or password.");
      err.status = 401;
      return next(err);
    } else {
      // Include HATEOAS links in the response
      const response = {
        ...user.toJSON(),
        links: [
          { rel: "self", method: "GET", href: `/users/${user.id}` },
          { rel: "logout", method: "POST", href: "/users/logout" },
        ],
      };
      res.status(200).json(response);
    }
  } catch (error) {
    // Handle specific errors: 400, 401, 404 and 500
    if (error.name === "SequelizeValidationError") {
      const err = new Error("Validation failed.");
      err.status = 400;
      errors.errors.map((e) => {
        if (e.path === "email") {
          return ("Email is mandatory", "Email must be valid.");
        }
        if (e.path === "password") {
          return "Password is mandatory.";
        }
        return e.message;
      });
      err.errors = errors;
      return next(err);
    }
    if (error.name === "NotFoundError") {
      const err = new Error("User not found.");
      err.status = 404;
      return next(err);
    }
    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};

// Controller to assign a task to a user
export const assignTaskToUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { habitId } = req.body;
    const user = await User.findByPk(userId);
    if (!user) {
      const err = new Error("User not found.");
      err.status = 404;
      return next(err);
    }
    const habit = await Habit.findByPk(habitId);
    if (!habit) {
      const err = new Error("Habit not found.");
      err.status = 404;
      return next(err);
    }
    await user.addHabit(habit);
    // Include HATEOAS links in the response
    const response = {
      ...user.toJSON(),
      links = [
      {
        rel: "self",
        method: "POST",
        href: `/users/${userId}/habits/${habitId}`,
      },
      { rel: "user_habits", method: "GET", href: `/users/${userId}/habits` },
    ]};
    res.status(200).json(response);
  } catch (error) {
    // Handle specific errors: 400, 401, 404, 409 and 500
    if (error.name === "SequelizeValidationError") {
      const err = new Error("Validation failed.");
      err.status = 400;
      errors.errors.map((e) => {
        if (e.path === "userId") {
          return "User is mandatory.";
        }
        if (e.path === "habitId") {
          return "Habit is mandatory.";
        }
        return e.message;
      });
      err.errors = errors;
      return next(err);
    }
    if (error.name === "UnauthorizedError") {
      const err = new Error("Missing or invalid authentication token.");
      err.status = 401;
      return next(err);
    }
    if (error.name === "ConflictError") {
      const err = new Error("This habit is already associated with the user.");
      err.status = 409;
      return next(err);
    }
    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};
