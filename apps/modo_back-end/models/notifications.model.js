// Use sequelize to create a model for the notifications table, with validations
/*
fields:
id_notificacao (integer, primary key, auto-increment)
id_utilizador (integer, foreign key to users.id_utilizador)
tipo_notificacao (enum, values: ['level','avatar', 'admin', 'system'], not null)
mensagem (text, not null)
data (date, not null)
lida (boolean, default false)
*/
//Use ES module syntax
// export function that takes a sequelize and DataTypes instance and defines the model, then returns it

export default (sequelize, DataTypes) =>
  sequelize.define(
    "notification",
    {
      id_notificacao: {
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
        tipo_notificacao: {
            type: DataTypes.ENUM("Level", "Avatar", "Admin", "System"),
            allowNull: false,
        },
        mensagem: { type: DataTypes.TEXT, allowNull: false },
        data: { type: DataTypes.DATE, allowNull: false },
        lida: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
        timestamps: false, // remove createdAt and updatedAt fields
    },
  );