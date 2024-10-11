const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Corretor = sequelize.define('Corretor', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Corretor;