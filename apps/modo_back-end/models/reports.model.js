/*
  Purpose: Defines the Report model for the application, representing periodic summaries of a user's environmental impact and system engagement. 
  Each report has a unique ID, a reference to the associated user, a title (titulo), a defined timeframe (periodo), a JSON payload of summarized statistics (dados_estatisticos), and an optional path to a generated document (url_pdf). 
  This model is used to persistently store historical performance metrics, allowing users to track their progress and habits over time.
*/

export default (sequelize, DataTypes) => {
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
};