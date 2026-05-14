// using sequelize with MySQL
// create a connection to the database using environment variables for configuration
import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
  },
);

// test the database connection
try {
  await sequelize.authenticate();
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
  process.exit(1);
}

// Models
import UserModel from "../models/users.model.js";
const User = UserModel(sequelize, DataTypes);

import HabitModel from "../models/habits.model.js";
const Habit = HabitModel(sequelize, DataTypes);

import TaskModel from "../models/tasks.model.js";
const Task = TaskModel(sequelize, DataTypes);

import ImpactModel from "../models/impacts.model.js";
const Impact = ImpactModel(sequelize, DataTypes);

import AvatarDecorationModel from "../models/avatarDecoration.model.js";
const AvatarDecoration = AvatarDecorationModel(sequelize, DataTypes);

import UserTasksModel from "../models/userTasks.model.js";
const UserTasks = UserTasksModel(sequelize, DataTypes);

import LocationModel from "../models/locations.model.js";
const Location = LocationModel(sequelize, DataTypes);

import NotificationModel from "../models/notifications.model.js";
const Notification = NotificationModel(sequelize, DataTypes);

import ReportModel from "../models/reports.model.js";
const Report = ReportModel(sequelize, DataTypes);

import UserDecorationsModel from "../models/userDecorations.model.js";
const UserDecorations = UserDecorationsModel(sequelize, DataTypes);

// Define relationships
// User has many Notifications (1:N)
User.hasMany(Notification, {
  foreignKey: "id_utilizador",
  onDelete: "CASCADE",
});
Notification.belongsTo(User, { foreignKey: "id_utilizador" });

// User has many Reports (1:N)
User.hasMany(Report, { foreignKey: "id_utilizador", onDelete: "CASCADE" });
Report.belongsTo(User, { foreignKey: "id_utilizador" });

// User has many Locations (1:N)
User.hasMany(Location, { foreignKey: "id_utilizador", onDelete: "CASCADE" });
Location.belongsTo(User, { foreignKey: "id_utilizador" });

// Habit has many Tasks (1:N)
Habit.hasMany(Task, { foreignKey: "id_habito", onDelete: "CASCADE" });
Task.belongsTo(Habit, { foreignKey: "id_habito" });

// Task has many Impacts (1:N)
Task.hasMany(Impact, { foreignKey: "id_tarefa", onDelete: "CASCADE" });
Impact.belongsTo(Task, { foreignKey: "id_tarefa" });

// User and Task have many-to-many relationship through UserTasks
User.belongsToMany(Task, {
  through: UserTasks,
  foreignKey: "id_utilizador",
  onDelete: "CASCADE",
});
Task.belongsToMany(User, {
  through: UserTasks,
  foreignKey: "id_tarefa",
  onDelete: "CASCADE",
});

// User and AvatarDecoration have many-to-many relationship through UserDecorations
User.belongsToMany(AvatarDecoration, {
  through: UserDecorations,
  foreignKey: "id_utilizador",
  onDelete: "CASCADE",
});
AvatarDecoration.belongsToMany(User, {
  through: UserDecorations,
  foreignKey: "id_decoracao",
  onDelete: "CASCADE",
});

// Sync the models with the database
try {
  await sequelize.sync({ alter: true }); // use { force: true } to drop and recreate tables on every sync (use with caution in production)
  console.log("All models were synchronized successfully.");
} catch (error) {
  console.error("Error synchronizing models:", error);
  process.exit(1);
}

// export the models for use in other modules
export {
  sequelize,
  User,
  Habit,
  Task,
  Impact,
  AvatarDecoration,
  UserTasks,
  Location,
  Notification,
  Report,
  UserDecorations,
};
