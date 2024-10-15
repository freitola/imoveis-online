const { Op } = require('sequelize');
const Property = require('../models/Property');

// Criar propriedade
exports.createProperty = async (req, res) => {
  const { title, price, location, bedrooms, bathrooms, size, image } = req.body;
  try {
    const property = await Property.create({
      title, price, location, bedrooms, bathrooms, size, image, createdBy: req.user.id
    });
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar propriedade.' });
  }
};

exports.listProperties = async (req, res) => {
  try {
    const {
      minPrice, maxPrice, location, bedrooms, bathrooms, size, orderBy = 'price', orderDirection = 'ASC', page = 1, limit = 10
    } = req.query;

    const whereClause = {};

    // Filtros opcionais
    if (minPrice) whereClause.price = { [Op.gte]: parseFloat(minPrice) };
    if (maxPrice) whereClause.price = { [Op.lte]: parseFloat(maxPrice) };
    if (location) whereClause.location = { [Op.iLike]: `%${location}%` };
    if (bedrooms) whereClause.bedrooms = parseInt(bedrooms);
    if (bathrooms) whereClause.bathrooms = parseInt(bathrooms);
    if (size) whereClause.size = parseFloat(size);

    const validOrderFields = ['price', 'size', 'bedrooms', 'bathrooms', 'location'];
    const validOrderDirections = ['ASC', 'DESC'];
    const validatedOrderBy = validOrderFields.includes(orderBy) ? orderBy : 'price';
    const validatedOrderDirection = validOrderDirections.includes(orderDirection.toUpperCase()) ? orderDirection.toUpperCase() : 'ASC';

    // Paginação
    const offset = (page - 1) * limit;

    const { count, rows: properties } = await Property.findAndCountAll({
      where: whereClause,
      order: [[validatedOrderBy, validatedOrderDirection]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      properties,
      currentPage: parseInt(page),
      totalPages
    });
  } catch (error) {
    console.error('Erro ao listar propriedades:', error);
    res.status(500).json({ message: 'Erro ao listar propriedades.', error: error.message });
  }
};

// Buscar propriedade por ID
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Propriedade não encontrada.' });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar propriedade.' });
  }
};

// Atualizar propriedade
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Propriedade não encontrada.' });
    }

    const { title, price, location, bedrooms, bathrooms, size, image } = req.body;
    property.title = title || property.title;
    property.price = price || property.price;
    property.location = location || property.location;
    property.bedrooms = bedrooms || property.bedrooms;
    property.bathrooms = bathrooms || property.bathrooms;
    property.size = size || property.size;
    property.image = image || property.image;

    await property.save();
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar propriedade.' });
  }
};

// Deletar propriedade
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Propriedade não encontrada.' });
    }

    await property.destroy();
    res.json({ message: 'Propriedade removida com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover propriedade.' });
  }
};

// Controller para buscar os imóveis em destaque (3 imóveis mais caros)
exports.getFeaturedProperties = async (req, res) => {
  try {
    const featuredProperties = await Property.findAll({
      limit: 3,
      order: [['price', 'DESC']]
    });

    return res.json({
      message: "Imóveis em destaque carregados com sucesso!",
      properties: featuredProperties
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao carregar imóveis em destaque.",
      error: error.message
    });
  }
};