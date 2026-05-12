// Use sequelize to create a model for the locations table, with validations
/*
fields:
id_localizacao (integer, primary key, auto-increment)
id_utilizador (integer, foreign key to users.id_utilizador)
latitude (decimal, not null)
longitude (decimal, not null)
cidade (string, not null)
pais (string, not null)
*/
//Use ES module syntax
// export function that takes a sequelize and DataTypes instance and defines the model, then returns it

export default (sequelize, DataTypes) =>
  sequelize.define(
    "location",
    {
      id_localizacao: {
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
        latitude: { type: DataTypes.DECIMAL, allowNull: false },
        longitude: { type: DataTypes.DECIMAL, allowNull: false },
        cidade: { type: DataTypes.STRING, allowNull: false },
        pais: { type: DataTypes.STRING, allowNull: false },
    },
    {
        timestamps: false, // remove createdAt and updatedAt fields
    },
  );