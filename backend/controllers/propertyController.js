const Property = require('../models/Property');
const Joi = require('joi');

// Esquema de validação com Joi
const propertySchema = Joi.object({
  title: Joi.string().required(),
  price: Joi.number().positive().required(),
  location: Joi.string().required(),
  bedrooms: Joi.number().integer().min(0).required(),
  bathrooms: Joi.number().integer().min(0).required(),
  size: Joi.number().positive().required(),
  type: Joi.string().required(),
});

// Criação de um imóvel
exports.createProperty = async (req, res) => {
  try {
    const { error } = propertySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, price, location, bedrooms, bathrooms, size, type } = req.body;
    const imagePath = req.file ? req.file.path : null;

    const newProperty = await Property.create({
      title, price, location, bedrooms, bathrooms, size, type, image: imagePath, createdBy: req.user.id,
    });

    res.json({ message: 'Imóvel cadastrado com sucesso!', property: newProperty });
  } catch (error) {
    console.error('Erro ao cadastrar o imóvel:', error);
    res.status(500).json({ message: 'Erro no servidor. Tente novamente mais tarde.' });
  }
};

// Listagem de imóveis
exports.getProperties = async (req, res) => {
  try {
    const {
      minPrice, maxPrice, location, bedrooms, minSize, maxSize, type, bathrooms, page = 1, limit = 10, orderBy = 'price', orderDirection = 'ASC', filterLogic = 'AND',
    } = req.query;

    const whereClause = {};

    if (minPrice) whereClause.price = { [Op.gte]: parseFloat(minPrice) };
    if (maxPrice) whereClause.price = { ...whereClause.price, [Op.lte]: parseFloat(maxPrice) };
    if (location) whereClause.location = { [Op.iLike]: `%${location}%` };
    if (bedrooms) whereClause.bedrooms = parseInt(bedrooms);
    if (minSize) whereClause.size = { [Op.gte]: parseFloat(minSize) };
    if (maxSize) whereClause.size = { ...whereClause.size, [Op.lte]: parseFloat(maxSize) };
    if (type) whereClause.type = { [Op.iLike]: `%${type}%` };
    if (bathrooms) whereClause.bathrooms = parseInt(bathrooms);

    const orderOptions = [[orderBy, orderDirection.toUpperCase()]];

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const properties = await Property.findAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: offset,
      order: orderOptions,
    });

    res.json({ message: 'Imóveis listados com sucesso!', properties, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('Erro ao listar os imóveis:', error);
    res.status(500).json({ message: 'Erro no servidor. Tente novamente mais tarde.' });
  }
};