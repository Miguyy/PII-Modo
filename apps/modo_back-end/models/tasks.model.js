/* 
  Purpose: Defines the Tarefas model for the application, representing tasks that users can complete as part of their habits. 
  Each task has a unique ID, a reference to the habit it belongs to, a name, points awarded for completion, a type (Check, Count, Timer), location (Inside or Outside), priority (Low, Medium, High), and additional fields for timer duration or count quantity as needed. 
  This model is used to manage the tasks associated with user habits and to track user progress and achievements in the system.
*/

export default (sequelize, DataTypes) =>
  sequelize.define(
    "Tarefas",
    {
      id_tarefa: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_habito: {
        type: DataTypes.INTEGER,
        references: { model: "Habitos", key: "id_habito" },
      },
      nome_tarefa: { type: DataTypes.STRING, allowNull: false },
      pontos_tarefa: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      tipo_tarefa: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [["Check", "Count", "Timer"]],
        },
      },
      localizacao_tarefa: {
        type: DataTypes.ENUM("Inside", "Outside"),
        allowNull: false,
      },
      prioridade_tarefa: {
        type: DataTypes.ENUM("Low", "Medium", "High"),
        allowNull: false,
      },
      duracao_temporizador: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isValidDuration(value) {
            if (
              this.tipo_tarefa === "Timer" &&
              (value === null || value <= 0)
            ) {
              throw new Error(
                "duracao_temporizador must be greater than 0 when tipo_tarefa is 'Timer'",
              );
            }
          },
        },
      },
      quantidade_necessaria: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isValidCount(value) {
            if (
              this.tipo_tarefa === "Count" &&
              (value === null || value <= 0)
            ) {
              throw new Error(
                "quantidade_necessaria must be greater than 0 when tipo_tarefa is 'Count'",
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
