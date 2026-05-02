/* export default (sequelize, DataTypes) => {
  const Notification = sequelize.define("Notification", {
    mensagem: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lida: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // All notifications start as unread
    }
    // Note: 'userId' will be created automatically by the association in db.config.js
  });

  return Notification;
}; */