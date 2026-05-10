/*
use sequelize to define the UserTasks model, with validations:
fields:
id_utilizador (integer, foreign key to users),
id_tarefa (integer, foreign key to tasks),
tarefa_ativa (tinyint, default 1, validate: isIn [0, 1]),
estado_tarefa (enum (Pending, Completed, failed), default Pending)
progresso (integer, default 0, validate: isInt, min 0)
data_inicio (date, default current date)
data_conclusao (date, allow null, validate: if estado_tarefa is "Completed" or "failed", then data_conclusao must not be null and must be after data_inicio)
use ES module syntax
export function that takes a sequelize and DataTypes instance and defines the model, then returns it
*/

export default (sequelize, DataTypes) =>
  sequelize.define(
    "user_tasks",
    {
      id_utilizador: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id_utilizador" },
      },
      id_tarefa: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "tasks", key: "id" },
      },
      tarefa_ativa: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
        validate: { isIn: [[0, 1]] },
      },
      estado_tarefa: {
        type: DataTypes.ENUM("Pending", "Completed"),
        defaultValue: "Pending",
      },
      progresso: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: { isInt: true, min: 0 },
      },
      data_inicio: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      data_conclusao: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          isValidEndDate(value) {
            if (
              (this.estado_tarefa === "Completed" ||
                this.estado_tarefa === "failed") &&
              (value === null || value <= this.data_inicio)
            ) {
              throw new Error(
                "data_conclusao must be after data_inicio when estado_tarefa is 'Completed' or 'failed'",
              );
            }
          },
        },
      },
    },
    {
      timestamps: false, // remove createdAt and updatedAt fields
    },
  );
