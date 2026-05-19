/*
  Purpose: Defines the Location model for the application, representing the geographical locations associated with users. 
  Each location has a unique ID, a reference to the associated user (id_utilizador), the country (pais), the city (cidade), and precise GPS coordinates. 
  This model is used to manage spatial data in the system, allowing users to associate their activities, tasks, or habits with specific physical places.
*/

export default (sequelize, DataTypes) =>
  sequelize.define(
    "Location",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_utilizador: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // Assuming your User model is named "User" and its primary key is "id"
        references: { model: "Users", key: "id" }, 
      },
      pais: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cidade: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      latitude: {
        // The JSON data has many decimal places (e.g., 39.3802122066059)
        // DECIMAL(10, 8) will safely store the most important digits for pinpoint accuracy
        type: DataTypes.DECIMAL(10, 8),
        allowNull: false,
        validate: {
          min: -90,
          max: 90,
        },
      },
      longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false,
        validate: {
          min: -180,
          max: 180,
        },
      },
    },
    {
      timestamps: true, // Keeps createdAt and updatedAt for sorting
    }
  );