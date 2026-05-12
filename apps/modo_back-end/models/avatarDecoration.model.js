// Use sequelize to create a model for the avatarDecoration table
/*
fields:
id_decoracao (integer, primary key, auto-increment)
nome_decoracao (string, not null)
nivel_necessario (integer, not null)
caminho_decoracao (string, not null)
*/
//Use ES module syntax
// export function that takes a sequelize and DataTypes instance and defines the model, then returns it

export default (sequelize, DataTypes) =>
  sequelize.define(
    "avatarDecoration",
    {
      id_decoracao: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        },
        nome_decoracao: { type: DataTypes.STRING, allowNull: false },
        nivel_necessario: { type: DataTypes.INTEGER, allowNull: false },
        caminho_decoracao: { type: DataTypes.STRING, allowNull: false },
    },
    {
        timestamps: false, // remove createdAt and updatedAt fields
    },
  );

