// use Sequelize to define the Habit model, with validations:
// fields: nome_habito (string, not null), descricao_habito (string, not null), categoria_habito (string, not null)
// use ES module syntax
// export function that takes a sequelize and DataTypes instance and defines the model, then returns it

export default (sequelize, DataTypes) => sequelize.define("habit", {
  nome_habito: { type: DataTypes.STRING, allowNull: false},
  descricao_habito: { type: DataTypes.STRING, allowNull: false},
  categoria_habito: { type: DataTypes.STRING, allowNull: false}
}, {
  timestamps: false // remove createdAt and updatedAt fields
});