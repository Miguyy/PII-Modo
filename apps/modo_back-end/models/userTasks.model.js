/*
  Purpose: Defines the Tarefas_Utilizador model for the application, representing the relationship between users and tasks.
  Each record in this model indicates that a specific user has a specific task, along with the status of that task (active or not), its progress, and the start and completion dates.
  This model is used to manage the tasks assigned to users, track their progress, and determine when tasks are completed or failed based on their status and dates.
*/

export default (sequelize, DataTypes) =>
  sequelize.define(
    "Tarefas_Utilizador",
    {
      id_utilizador: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: "Utilizador", key: "id_utilizador" },
      },
      id_tarefa: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: "Tarefas", key: "id_tarefa" },
      },
      tarefa_ativa: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        validate: { isIn: [[true, false]] },
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
              this.estado_tarefa === "Completed" ||
              value === null ||
              value <= this.data_inicio
            ) {
              throw new Error(
                "data_conclusao must be after data_inicio when estado_tarefa is 'Completed'",
              );
            }
          },
        },
      },
    },
    {
      timestamps: false, // remove createdAt and updatedAt fields
      freezeTableName: true,
    },
  );
