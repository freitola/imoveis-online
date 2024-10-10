const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');  // Importa a instância do Sequelize

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('corretor', 'cliente'),
    allowNull: false,
  },
});

module.exports = User;