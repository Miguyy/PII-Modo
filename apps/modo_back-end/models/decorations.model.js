/* export default (sequelize, DataTypes) => {
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
}; */