/*
use Sequelize to define the Impact model, with validations:
fields:
id_impacto (integer, primary key, auto-increment),
id_tarefa (integer, foreign key to tasks),
tipo_impacto (enum 'Water','Energy','Residuals', 'Mobility', 'Emissions', not null),
valor_por_unidade (decimal, not null, validate: isDecimal, min 0)
unidade (string, not null)
use ES module syntax
export function that takes a sequelize and DataTypes instance and defines the model, then returns it

*/

export default (sequelize, DataTypes) =>
  sequelize.define(
    "impact",
    {
      id_impacto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_tarefa: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "tasks", key: "id" },
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
