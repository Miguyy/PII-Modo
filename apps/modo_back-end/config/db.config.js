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

import ActiveAvatarDecorationModel from "../models/activeAvatarDecoration.model.js";
const ActiveAvatarDecoration = ActiveAvatarDecorationModel(
  sequelize,
  DataTypes,
);

// add relationships here
// N:M relationship between Product and Cart through a join table CartProducts
// add RESTRICT on delete to prevent deleting products that are in carts,and cascading delete for cart items when a cart is deleted
/* 
Product.belongsToMany(Cart,{through: CartItem, onDelete: "RESTRICT", foreignKey: "itemId"});
Cart.belongsToMany(Product, { through: CartItem, onDelete: "CASCADE" }); */

// Sync the models with the database
try {
  await sequelize.sync({ alter: true }); // use { force: true } to drop and recreate tables on every sync (use with caution in production)
  console.log("All models were synchronized successfully.");
} catch (error) {
  console.error("Error synchronizing models:", error);
  process.exit(1);
}

// export the models for use in other modules
export {};
