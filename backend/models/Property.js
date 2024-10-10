const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Definindo o modelo de Property (Imóvel)
const Property = sequelize.define('Property', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bedrooms: {
    type: DataTypes.INTEGER,  // Número de quartos
    allowNull: true
  },
  bathrooms: {
    type: DataTypes.INTEGER,  // Número de banheiros
    allowNull: true
  },
  size: {
    type: DataTypes.FLOAT,  // Tamanho em metros quadrados
    allowNull: true
  },
  type: {
    type: DataTypes.STRING,  // Tipo de imóvel (apartamento, casa, etc.)
    allowNull: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = Property;