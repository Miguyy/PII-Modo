/*
  Purpose: Defines the Localizacao model for the application, representing user locations. 
  Each location has a unique ID, a reference to the user it belongs to, latitude and longitude coordinates, and city and country information. 
  This model is used to store and manage the geographical locations associated with users in the system.
*/
export default (sequelize, DataTypes) =>
  sequelize.define(
    "Localizacao",
    {
      id_localizacao: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_utilizador: {
        type: DataTypes.INTEGER,
        references: {
          model: "Utilizador",
          key: "id_utilizador",
        },
      },
      latitude: { type: DataTypes.DECIMAL(6, 4), allowNull: false },
      longitude: { type: DataTypes.DECIMAL(6, 4), allowNull: false },
      cidade: { type: DataTypes.STRING, allowNull: false },
      pais: { type: DataTypes.STRING, allowNull: false },
    },
    {
      timestamps: false, // remove createdAt and updatedAt fields
      freezeTableName: true,
    },
  );
