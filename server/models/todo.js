module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');
  const Todo = sequelize.define('Todo', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    completed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    categoryId: { type: DataTypes.INTEGER, allowNull: true, field: 'category_id' }
  }, { tableName: 'todos', timestamps: true });
  return Todo;
};
