/* 
    Purpose: Defines the Decoracao_Avatar_Utilizador model for the application, representing the relationship between users and avatar decorations.
    Each record in this model indicates that a specific user has acquired a specific avatar decoration, and whether that decoration is currently active for the user's avatar.
    This model is used to manage the avatar decorations that users have unlocked and to determine which decoration is currently active for each user's avatar.
*/
export default (sequelize, DataTypes) =>
  sequelize.define(
    "Decoracao_Avatar_Utilizador",
    {
      id_utilizador: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: "Utilizador", key: "id_utilizador" },
      },
      id_decoracao: {
        type: DataTypes.INTEGER,
        allowNull: true, // NULL = sem decoração ativa
        references: { model: "Decoracao_Avatar", key: "id_decoracao" },
      },
    },
    {
      timestamps: false, // remove createdAt and updatedAt fields
      freezeTableName: true,
    },
  );
