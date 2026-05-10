// use Sequelize do define the Task model, with validations:
// fields:
// id_tarefa (integer, foreign key to habits),
// nome_tarefa (string, not null),
// pontos_tarefa (integer, not null),
// tipo_tarefa (string, not null, validate: only "Count", "Timer", "check")
// localizacao_tarefa (enum (inside, outside), not null)
// prioridade_tarefa (integer, not null, validate: 1-3)
// duracao_temporizador (integer, allow null, validate: if tipo_tarefa is "Timer", then duracao_temporizador must be > 0)
// quantidade_necessaria (integer, allow null, validate: if tipo_tarefa is "Count", then quantidade_necessaria must be > 0)
// use ES module syntax
// export function that takes a sequelize and DataTypes instance and defines the model, then returns it

export default (sequelize, DataTypes) =>
  sequelize.define(
    "task",
    {
      id_tarefa: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "habits", key: "id" },
      },
      nome_tarefa: { type: DataTypes.STRING, allowNull: false },
      pontos_tarefa: { type: DataTypes.INTEGER, allowNull: false },
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
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 3 },
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
      Timerstamps: false, // remove createdAt and updatedAt fields
    },
  );
