const { Sequelize } = require('sequelize');
const cfg = require('../config');

const sequelize = new Sequelize(cfg.databaseUrl, { logging: false, define: { underscored: true } });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Category = require('./category')(sequelize);
db.Todo = require('./todo')(sequelize);

// Associations
db.Category.hasMany(db.Todo, { foreignKey: 'categoryId', onDelete: 'SET NULL' });
db.Todo.belongsTo(db.Category, { foreignKey: 'categoryId' });

module.exports = db;
