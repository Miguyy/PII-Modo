/*
  Purpose: Defines the Impacto model for the application, representing the environmental impacts associated with each task. 
  Each impact has a unique ID, a reference to the associated task, a type of impact (e.g., water, energy, residuals, mobility, emissions), a value per unit of impact, and the unit of measurement. 
  This model is used to manage the environmental impacts of tasks in the system and to calculate the total impact based on user activities and progress.
*/

export default (sequelize, DataTypes) =>
  sequelize.define(
    "Impacto",
    {
      id_impacto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_tarefa: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Tarefas", key: "id_tarefa" },
      },
      tipo_impacto: {
        type: DataTypes.ENUM(
          "Water",
          "Energy",
          "Residuals",
          "Mobility",
          "Emissions",
        ),
        allowNull: false,
      },
      valor_por_unidade: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          isFloat: true, // validate it is a number
          isPositive(value) {
            // can not be zero, use custom validator
            if (value <= 0)
              throw new Error("valor_por_unidade must be a positive number");
          },
        },
      },
      unidade: {
        type: DataTypes.ENUM("Litters", "kWh", "kg", "km", "kg CO2e"),
        allowNull: false,
      },
    },
    {
      timestamps: false, // remove createdAt and updatedAt fields
    },
  );
