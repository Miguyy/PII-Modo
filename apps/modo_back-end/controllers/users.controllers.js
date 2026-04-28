// Import users data
/* import { User } from "../config/db.config.js"; */

// Controller to create a new user
export const createUser = async (req, res, next) => {
  try {
    const { nome, email, password } = req.body;
    // Validate required fields
    const user = await User.create({ nome, email, password, tipo_utilizador = "Cliente"});

    const response = {
      ...user.toJSON(),
      links: [
        { rel: "login", method: "POST", href: "/users/login" },
        { rel: "self", method: "GET", href: `/users/${user.id}` },
      ]
    };
    res.status(201).json(response);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const err = new Error ("Validation failed.")
      err.status = 400;
      err.errors = error.errors.map(e => e.message);
      return next(err);
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      const err = new Error("Resource conflict.");
      err.status = 409;
      err.errors = ["A user with this email already exists."];
      return next(err);
    }

    const err = new Error("Internal server error.");
    err.status = 500;
    return next(err);
  }
};

// Controller to get all users
export const getAllUsers = async (req, res, next) => {

  const { page = 1, limit = 5, role = "admin" } = req.query;

  try{
    const users = await User.findAll();
    console.log(`Found ${users.length} users in the database.`);
    res.status(200).json(users);
  }
    catch (error) {
      if (error.name === "UnauthorizedError") {
        const err = new Error("Unauthorized. Missing or invalid authentication token.");
        err.status = 401;
        return next(err);
      }
      if (error.name === "ForbiddenError") {
        const err = new Error("You do not have permission to access this resource");
        err.status = 403;
        return next(err);
      }
      
      const err = new Error("Internal server error.");
      err.status = 500;
      return next(err);
    }
}

// Controller to get a user by ID
export const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) {
      const err = new Error("Resource not found.");
      err.status = 404;
      return next(err);
    }
    res.status(200).json(user);
  } catch (error) {
    if (error.name === "UnauthorizedError") {
      const err = new Error("Missing or invalid authentication token.");
      err.status = 401;
      return next(err);
    }
    if (error.name === "ForbiddenError") {
      const err = new Error("You do not have permission to access this resource.");
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
      const err = new Error("Resource not found.");
      err.status = 404;
      return next(err);
    }
    await user.update({ email, password });
    res.status(200).json(user);
  } catch (error) {
    if (error.name === "UnauthorizedError") {
      const err = new Error("Missing or invalid authentication token.");
      err.status = 401;
      return next(err);
    }
    if (error.name === "ForbiddenError") {
      const err = new Error("You do not have permission to access this resource.");
      err.status = 403;
      return next(err);
    }
    if (error.name === "SequelizeValidationError") {
      const err = new Error("Validation failed.");
      err.status = 400;
      err.errors = error.errors.map(e => e.message);
      return next(err);
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      const err = new Error("Resource conflict.");
      err.status = 409; 
      err.errors = ["A user with this email already exists."];
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
  }
    catch (error) {
      if (error.name === "BadRequestError") {
        const err = new Error("Invalid user ID format.");
        err.status = 400;
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
    }
    else{
      const response = {
        ...user.toJSON(),
        links: [{
          rel: "self", method: "GET", href: `/users/${user.id}`,
          rel: "logout", method: "POST", href: "/users/logout"
        }]
      }
      res.status(200).json(response);
    }
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const err = new Error("Validation failed.");
      err.status = 400;
      err.errors = error.errors.map(e => e.message);
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
    res.status(200).json({ message: "Habit assigned to user successfully." });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const err = new Error("Validation failed.");
      err.status = 400;
      err.errors = error.errors.map(e => e.message);
      return next(err);
    }
    if (error.name === "UnauthorizedError") {
      const err = new Error("Missing or invalid authentication token.");
      err.status = 401;
      return next(err);
    }
    if (error.name === "NotFoundError") {
      const err = new Error("Resource not found.");
      err.status = 404;
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