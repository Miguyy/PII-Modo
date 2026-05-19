/*
  Purpose: Defines the Notificacao model for the application, representing notifications that users receive in the system. 
  Each notification has a unique ID, a reference to the user it belongs to, a type of notification (e.g., level up, avatar unlocked, admin message, system alert), a message content, a timestamp for when the notification was created, and a boolean indicating whether the notification has been read. 
  This model is used to manage user notifications in the system and to provide users with relevant updates and information based on their activities and progress.
*/
export default (sequelize, DataTypes) =>
  sequelize.define(
    "Notificacao",
    {
      id_notificacao: {
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
      tipo_notificacao: {
        type: DataTypes.ENUM("Level", "Avatar", "Admin", "System"),
        allowNull: false,
      },
      mensagem: { type: DataTypes.TEXT, allowNull: false },
      data: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      lida: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      timestamps: false, // remove createdAt and updatedAt fields
      freezeTableName: true,
    },
  );
