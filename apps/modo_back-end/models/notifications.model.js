/*
  Purpose: Defines the Notification model for the application, representing system alerts and messages directed at specific users. 
  Each notification has a unique ID, a reference to the target user, the message content (mensagem), and a boolean status flag (lida) tracking whether the user has read it. 
  This model is used to manage the internal communication loop, keeping users informed about their progress, achievements, or necessary actions.
*/

export default (sequelize, DataTypes) => {
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
};
