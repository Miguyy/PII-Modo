/*
  Purpose: Defines the Utilizador model for the application, representing users in the system. 
  Each user has a unique ID, a name, an email, a hashed password, points, account creation date, user type (Admin or Client), level, and an optional profile image. 
  This model is used to manage user information and authentication in the system, as well as to track user progress and achievements through points and levels.
*/

export default (sequelize, DataTypes) =>
  sequelize.define(
    "Utilizador",
    {
      id_utilizador: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nome: { type: DataTypes.STRING, allowNull: false },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      hashed_password: { type: DataTypes.STRING, allowNull: false },
      pontos: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: { isInt: true, min: 0 },
      },
      data_criacao_conta: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      tipo_utilizador: {
        type: DataTypes.ENUM("Admin", "Client"),
        defaultValue: "Client",
      },
      nivel: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      imagem_utilizador: { type: DataTypes.STRING, allowNull: true },
    },
    {
      timestamps: false, // remove createdAt and updatedAt fields
      freezeTableName: true,
    },
  );
