//use Sequelize to define the User model, with validations:
/*
fields:
id_utilizador (integer, primary key, auto-increment),
nome (string, not null),
email (string, not null, unique, validate: isEmail),
hashed_password (string, not null),
pontos (integer, default 0, validate: isInt, min 0)
data_criacao_conta (date, default current date)
tipo_utilizador (enum (Admin, Cliente), default Cliente)
*/
// use ES module syntax
// export function that takes a sequelize and DataTypes instance and defines the model, then returns it

export default (sequelize, DataTypes) =>
  sequelize.define(
    "user",
    {
      id_utilizador: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nome: { type: DataTypes.STRING, allowNull: false },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      hashed_password: { type: DataTypes.STRING, allowNull: false },
      pontos: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: { isInt: true, min: 0 },
      },
      data_criacao_conta: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      tipo_utilizador: {
        type: DataTypes.ENUM("Admin", "Cliente"),
        defaultValue: "Cliente",
      },
    },
    {
      timestamps: false, // remove createdAt and updatedAt fields
    },
  );
