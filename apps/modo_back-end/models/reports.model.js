/*
  Purpose: Defines the Relatorio model for the application, representing user reports. 
  Each report has a unique ID, a reference to the user it belongs to, month and week information for when the report was generated, a timestamp for when the report was created, the content of the report, and a file path to the generated report. 
  This model is used to manage user reports in the system and to provide users with insights and summaries based on their activities and progress.
*/

export default (sequelize, DataTypes) =>
  sequelize.define(
    "Relatorio",
    {
      id_relatorio: {
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
      mes: { type: DataTypes.INTEGER, allowNull: false },
      semana: { type: DataTypes.INTEGER, allowNull: false },
      data_geracao: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      conteudo: { type: DataTypes.TEXT, allowNull: false },
      caminho_relatorio: { type: DataTypes.STRING, allowNull: false },
    },
    {
      timestamps: false, // remove createdAt and updatedAt fields
    },
  );
