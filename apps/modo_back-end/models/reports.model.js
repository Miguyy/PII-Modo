/* export default (sequelize, DataTypes) => {
  const Report = sequelize.define("Report", {
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    periodo: {
      type: DataTypes.STRING, // e.g., "Maio 2026" or "2026-W18"
      allowNull: false,
    },
    dados_estatisticos: {
      type: DataTypes.JSON, // Stores the summary data in JSON format
      allowNull: true,
    },
    url_pdf: {
      type: DataTypes.STRING, // URL/Path to the generated PDF file
      allowNull: true,
    }
    // Note: 'userId' will be created automatically by the association in db.config.js
  });

  return Report;
}; */