// Use sequelize to create a model for the reports table, with validations
/*
fields:
id_relatorio (integer, primary key, auto-increment)
id_utilizador (integer, foreign key to users.id_utilizador)
mes (integer, not null)
semana (integer, not null)
data_geracao (date, not null)
conteudo_relatorio (text, not null)
caminho_relatorio (string, not null)
*/
//Use ES module syntax
// export function that takes a sequelize and DataTypes instance and defines the model, then returns it

export default (sequelize, DataTypes) =>
  sequelize.define(
    "report",
    {
      id_relatorio: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
        id_utilizador: {
            type: DataTypes.INTEGER,
            references: {
            model: "users",
                key: "id_utilizador",
            },
        },
        mes: { type: DataTypes.INTEGER, allowNull: false },
        semana: { type: DataTypes.INTEGER, allowNull: false },
        data_geracao: { type: DataTypes.DATE, allowNull: false },
        conteudo_relatorio: { type: DataTypes.TEXT, allowNull: false },
        caminho_relatorio: { type: DataTypes.STRING, allowNull: false },
    },
    {
        timestamps: false, // remove createdAt and updatedAt fields
    },
  );