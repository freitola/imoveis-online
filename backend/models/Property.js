const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Property = sequelize.define('Property', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bedrooms: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bathrooms: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  size: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
});

module.exports = Property;