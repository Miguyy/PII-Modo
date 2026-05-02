/* export default (sequelize, DataTypes) => {
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
}; */