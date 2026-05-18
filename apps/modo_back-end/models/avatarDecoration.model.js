/*
  Purpose: Defines the AvatarDecoration model for the application, representing avatar decorations that users can acquire and use to customize their avatars. 
  Each decoration has a unique ID, a name, a required level for unlocking, and a file path to the decoration's image. 
  This model is used to manage the available avatar decorations in the system and to associate them with user avatars based on their progress and achievements.
*/

export default (sequelize, DataTypes) =>
  sequelize.define(
    "Decoracao_Avatar",
    {
      id_decoracao: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nome_decoracao: { type: DataTypes.STRING, allowNull: false },
      nivel_necessario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      caminho_decoracao: { type: DataTypes.STRING, allowNull: false },
    },
    {
      timestamps: false, // remove createdAt and updatedAt fields
      freezeTableName: true,
    },
  );
