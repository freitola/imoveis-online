const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Property = require('./Property');

const Favorite = sequelize.define('Favorite', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  propertyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Property,
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
});

// Defina a associação: um favorito pertence a um imóvel
Favorite.belongsTo(Property, { foreignKey: 'propertyId' });

module.exports = Favorite;