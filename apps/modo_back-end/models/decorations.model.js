/*
  Purpose: Defines the Decoration model for the application, representing the global catalog of gamification items available. 
  Each decoration has a unique ID, a name (nome), a required user level to unlock (nivel_necessario), a cost in points (preco_pontos), and an image URL (imagem_url). 
  This model is used to manage the application's reward system and store, defining the customizable assets that users can acquire for their avatars.
*/

export default (sequelize, DataTypes) => {
  const Decoration = sequelize.define("Decoration", {
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nivel_necessario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1, // Default to level 1 if not specified
    },
    preco_pontos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    imagem_url: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  });

  return Decoration;
};