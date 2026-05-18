/*
  Purpose: Defines the UserDecoration model for the application, acting as a junction table to map the many-to-many relationship between Users and Decorations. 
  Each record represents an item owned by a user, containing a unique ID, references to both the user and the decoration, and a boolean flag (is_active) indicating if the item is currently equipped. 
  This model is used to manage individual user inventories and track the active customization state of their avatars.
*/

export default (sequelize, DataTypes) => {
  const UserDecoration = sequelize.define("UserDecoration", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // By default, a newly unlocked decoration is not equipped
    }
    // Note: 'userId' and 'decorationId' will be added by the associations in db.config.js
  });

  return UserDecoration;
};
