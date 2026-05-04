// Import users data
import jwt from "jsonwebtoken";
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
    // Handle specific errors: 400, 409 and 500
    if (error.name === "SequelizeValidationError") {
      const errors = {};

      error.errors.forEach((e) => {
        if (e.path === "email") {
          errors.email = ["Email is mandatory.", "Email must be valid."];
        }
        if (e.path === "password") {
          errors.password = [
            "Password must have between 12 and 15 characters.",
            "Password must include uppercase, lowercase, numbers and special characters.",
          ];
        }
      });

      return next({
        status: 400,
        message: "Validation failed.",
        errors,
      });
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      return next({
        status: 409,
        message: "Resource conflict.",
        errors: { email: ["A user with this email already exists."] },
      });
    }

    return next({
      status: 500,
      message: "Internal server error.",
    });
  }
};

// Controller to get all users
export const getAllUsers = async (req, res, next) => {
  // Extract pagination and filtering parameters from query string
  const { page = 1, limit = 5, role } = req.query; // TODO: Implement filtering when the DB/Sequelize are ready

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
    // Handle specific errors: 500
    return next({
      status: 500,
      message: "Internal server error.",
    });
  }
};

// Controller to get a user by ID
export const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await req.user;

    if (!user) {
      return next({
        status: 404,
        message: "User not found.",
      });
    }

    // Include HATEOAS links in the response
    const response = {
      ...user.toJSON(),
      links: [{ rel: "self", method: "GET", href: `/users/${user.id}` }],
    };
    res.status(200).json(response);
  } catch (error) {
    // Handle specific errors: 500
    return next({
      status: 500,
      message: "Internal server error.",
    });
  }
};

// Controller to update a user
export const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { email, password } = req.body;
    const user = await req.user;

    if (!user) {
      return next({
        status: 404,
        message: "User not found.",
      });
    }
    await user.update({ email, password });

    // Include HATEOAS links in the response
    const response = {
      ...user.toJSON(),
      links: [{ rel: "self", method: "GET", href: `/users/${user.id}` }],
    };
    res.status(200).json(response);
  } catch (error) {
    // Handle specific errors: 409 and 500
    if (error.name === "SequelizeUniqueConstraintError") {
      return next({
        status: 409,
        message: "Resource conflict.",
        errors: { email: ["A user with this email already exists."] },
      });
    }
    return next({
      status: 500,
      message: "Internal server error.",
    });
  }
};

// Controller to delete a user
export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await req.user;

    if (!user) {
      return next({
        status: 404,
        message: "User not found.",
      });
    }
    await user.destroy();
    res.status(204).send();
  } catch (error) {
    // Handle specific errors: 500
    return next({
      status: 500,
      message: "Internal server error.",
    });
  }
};

// Controller to login a user
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return next({
        status: 401,
        message: "Invalid credentials.",
      });
    }

    if (user.password !== password) {
      return next({
        status: 401,
        message: "Invalid credentials.",
      });
    }

    const token = jwt.sign(
      { id: user.id, tipo_utilizador: user.tipo_utilizador },
      process.env.JWT_SECRET,
    );

    // Include HATEOAS links in the response
    const response = {
      token,
      ...user.toJSON(),
      links: [
        { rel: "self", method: "GET", href: `/users/${user.id}` },
        { rel: "logout", method: "POST", href: "/users/logout" },
      ],
    };
    res.status(200).json(response);
  } catch (error) {
    // Handle specific errors: 500
    return next({
      status: 500,
      message: "Internal server error.",
    });
  }
};

// Controller to assign a task to a user
export const assignTaskToUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { habitId } = req.body;
    const user = await req.user;

    if (!user) {
      return next({
        status: 404,
        message: "User not found.",
      });
    }

    const habit = await Habit.findByPk(habitId);
    if (!habit) {
      return next({
        status: 404,
        message: "Habit not found.",
      });
    }
    await user.addHabit(habit);

    // Include HATEOAS links in the response
    const response = {
      ...user.toJSON(),
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
    return next({
      status: 500,
      message: "Internal server error.",
    });
  }
};
