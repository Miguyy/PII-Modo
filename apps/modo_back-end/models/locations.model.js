/* export default (sequelize, DataTypes) => {
  const Location = sequelize.define("Location", {
    nome_localizacao: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      // This ensures high precision for GPS coordinates.
      type: DataTypes.DECIMAL(10, 8), 
      allowNull: false,
    },
    longitude: {
      // Longitude goes up to 180, hence the 11 total digits instead of 10.
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    }
    // Note: 'userId' will be created automatically by the association in db.config.js
  });

  return Location;
}; */