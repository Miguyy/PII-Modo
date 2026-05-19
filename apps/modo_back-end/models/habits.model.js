/*  
  Purpose: Defines the Habitos model for the application, representing the habits that users can choose to adopt and track. 
  Each habit has a unique ID, a name, a description, and a category. 
  This model is used to manage the available habits in the system and to associate them with user tasks and progress tracking.
*/
export default (sequelize, DataTypes) =>
  sequelize.define(
    "Habitos",
    {
      id_habito: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nome_habito: { type: DataTypes.STRING, allowNull: false },
      descricao_habito: { type: DataTypes.STRING, allowNull: false },
      categoria: { type: DataTypes.STRING, allowNull: false },
    },
    {
      timestamps: false, // remove createdAt and updatedAt fields
    },
  );
