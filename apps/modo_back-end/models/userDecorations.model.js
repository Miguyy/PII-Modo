//Use sequelize to create a model for the userDecorations table, with validations
/*
fields:
id_utilizador (integer, foreign key to users.id_utilizador)
id_decoracao  (integer, foreign key to avatarDecorations.id_decoracao)
decoração_ativa (boolean, default false)
*/
//Use ES module syntax
// export function that takes a sequelize and DataTypes instance and defines the model, then returns it

export default (sequelize, DataTypes) =>
  sequelize.define(
    "userDecoration",
    {
        id_utilizador: {
            type: DataTypes.INTEGER,
            references: {
            model: "users",
                key: "id_utilizador",
            },
        },
        id_decoracao: {
            type: DataTypes.INTEGER,
            references: {
            model: "avatarDecoration",
                key: "id_decoracao",
            },
        },
        decoracao_ativa: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
        timestamps: false, // remove createdAt and updatedAt fields
    },
  );
