const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authRoutes = require('./routes/authRoutes');
const sequelize = require('./config/database');
const jwt = require('jsonwebtoken');
const Property = require('./models/Property');
const Favorite = require('./models/Favorite');
const { Op } = require('sequelize');
const errorHandler = require('./middleware/errorHandler'); // Middleware para tratamento de erros
const logger = require('./utils/logger'); // Logger

// Configurações
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(setContentTypeUTF8);
app.use(bodyParser.json({ type: 'application/json; charset=utf-8' }));
app.use(express.json());

// Configuração do multer para upload de imagens
const upload = multer({ storage: configureMulterStorage() });

// Funções auxiliares
function setContentTypeUTF8(req, res, next) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
}

function configureMulterStorage() {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = 'uploads/';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
}

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Você precisa estar logado para acessar essa página.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    handleJWTError(error, res);
  }
}

function handleJWTError(error, res) {
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Seu login expirou. Por favor, faça login novamente.' });
  }
  return res.status(401).json({ message: 'Erro ao verificar sua sessão. Tente novamente.' });
}

function checkRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Você não tem permissão para realizar essa ação.' });
    }
    next();
  };
}

function updatePropertyFields(property, data) {
  property.title = data.title || property.title;
  property.price = data.price || property.price;
  property.location = data.location || property.location;
  property.size = data.size || property.size;
  property.bedrooms = data.bedrooms || property.bedrooms;
  property.bathrooms = data.bathrooms || property.bathrooms;
  property.image = data.image || property.image;
  return property;
}

// Rotas de Imóveis
app.post('/api/properties', authMiddleware, checkRole('corretor'), upload.single('image'), async (req, res) => {
  try {
    const newProperty = await createNewProperty(req);
    logger.info(`Imóvel cadastrado com sucesso: ${newProperty.title}`);
    res.json({ message: 'Imóvel cadastrado com sucesso!', property: newProperty });
  } catch (error) {
    logger.error('Erro ao cadastrar o imóvel: ' + error.message);
    handleError(error, res, 'Erro ao cadastrar o imóvel.');
  }
});

async function createNewProperty(req) {
  const { title, price, location, bedrooms, bathrooms, size, type } = req.body;
  validatePropertyData({ title, price, location, bedrooms, bathrooms, size, type });
  const imagePath = req.file ? req.file.path : null;

  return await Property.create({
    title, price, location, bedrooms, bathrooms, size, type, image: imagePath, createdBy: req.user.id
  });
}

function validatePropertyData({ title, price, location, bedrooms, bathrooms, size, type }) {
  if (!title || typeof title !== 'string') throw new Error('O título do imóvel é obrigatório.');
  if (!price || isNaN(price) || price <= 0) throw new Error('Informe um preço válido.');
  if (!location || typeof location !== 'string') throw new Error('A localização é obrigatória.');
  if (bedrooms === undefined || isNaN(bedrooms) || bedrooms < 0) throw new Error('Número de quartos inválido.');
  if (bathrooms === undefined || isNaN(bathrooms) || bathrooms < 0) throw new Error('Número de banheiros inválido.');
  if (size === undefined || isNaN(size) || size <= 0) throw new Error('Informe um tamanho válido.');
  if (!type || typeof type !== 'string') throw new Error('O tipo de imóvel é obrigatório.');
}

app.get('/api/properties', authMiddleware, async (req, res) => {
  try {
    const properties = await listProperties(req.query);
    res.json({ message: 'Imóveis listados com sucesso!', properties });
  } catch (error) {
    logger.error('Erro ao listar os imóveis: ' + error.message);
    handleError(error, res, 'Erro ao listar os imóveis.');
  }
});

async function listProperties(query) {
  const {
    minPrice, maxPrice, location, bedrooms, minSize, maxSize, type, bathrooms,
    page = 1, limit = 10, orderBy = 'price', orderDirection = 'ASC', filterLogic = 'AND'
  } = query;

  const whereClause = buildWhereClause({ minPrice, maxPrice, location, bedrooms, minSize, maxSize, type, bathrooms });
  const filterLogicOp = filterLogic.toUpperCase() === 'OR' ? Op.or : Op.and;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  return await Property.findAll({
    where: { [filterLogicOp]: whereClause },
    limit: parseInt(limit),
    offset,
    order: [[orderBy, orderDirection.toUpperCase()]]
  });
}

function buildWhereClause({ minPrice, maxPrice, location, bedrooms, minSize, maxSize, type, bathrooms }) {
  const whereClause = {};
  if (minPrice) whereClause.price = { [Op.gte]: parseFloat(minPrice) };
  if (maxPrice) whereClause.price = { ...whereClause.price, [Op.lte]: parseFloat(maxPrice) };
  if (location) whereClause.location = { [Op.iLike]: `%${location}%` };
  if (bedrooms) whereClause.bedrooms = parseInt(bedrooms);
  if (minSize) whereClause.size = { [Op.gte]: parseFloat(minSize) };
  if (maxSize) whereClause.size = { ...whereClause.size, [Op.lte]: parseFloat(maxSize) };
  if (type) whereClause.type = { [Op.iLike]: `%${type}%` };
  if (bathrooms) whereClause.bathrooms = parseInt(bathrooms);
  return whereClause;
}

app.put('/api/properties/:id', authMiddleware, checkRole('corretor'), async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);
    if (!property) return res.status(404).json({ message: 'Imóvel não encontrado.' });

    updatePropertyFields(property, req.body);
    await property.save();
    res.json({ message: 'Imóvel atualizado com sucesso!', property });
  } catch (error) {
    logger.error('Erro ao atualizar o imóvel: ' + error.message);
    handleError(error, res, 'Erro ao atualizar o imóvel.');
  }
});

app.delete('/api/properties/:id', authMiddleware, checkRole('corretor'), async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);
    if (!property) return res.status(404).json({ message: 'Imóvel não encontrado.' });

    await property.destroy();
    res.json({ message: 'Imóvel removido com sucesso!' });
  } catch (error) {
    logger.error('Erro ao remover o imóvel: ' + error.message);
    handleError(error, res, 'Erro ao remover o imóvel.');
  }
});

// Rotas de Favoritos
app.post('/api/favorites', authMiddleware, async (req, res) => {
  try {
    const favorite = await addFavorite(req);
    res.json({ message: 'Imóvel adicionado aos favoritos!', favorite });
  } catch (error) {
    logger.error('Erro ao adicionar o imóvel aos favoritos: ' + error.message);
    handleError(error, res, 'Erro ao adicionar o imóvel aos favoritos.');
  }
});

async function addFavorite(req) {
  const property = await Property.findByPk(req.body.propertyId);
  if (!property) throw new Error('Imóvel não encontrado.');

  const existingFavorite = await Favorite.findOne({ where: { userId: req.user.id, propertyId: req.body.propertyId } });
  if (existingFavorite) throw new Error('Este imóvel já está na sua lista de favoritos.');

  return await Favorite.create({ userId: req.user.id, propertyId: req.body.propertyId });
}

app.get('/api/favorites', authMiddleware, async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { userId: req.user.id },
      include: [Property]
    });
    res.json({ message: 'Seus imóveis favoritos foram carregados com sucesso!', favorites });
  } catch (error) {
    logger.error('Erro ao carregar os favoritos: ' + error.message);
    handleError(error, res, 'Erro ao carregar seus favoritos.');
  }
});

app.delete('/api/favorites/:propertyId', authMiddleware, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({ where: { userId: req.user.id, propertyId: req.params.propertyId } });
    if (!favorite) return res.status(404).json({ message: 'Este imóvel não está na sua lista de favoritos.' });

    await favorite.destroy();
    res.json({ message: 'Imóvel removido dos favoritos!' });
  } catch (error) {
    logger.error('Erro ao remover o imóvel dos favoritos: ' + error.message);
    handleError(error, res, 'Erro ao remover o imóvel dos favoritos.');
  }
});

// Rota de autenticação
app.use('/api', authRoutes);

// Inicialização do Servidor
sequelize.sync()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch(err => {
    logger.error('Erro ao conectar ao banco de dados: ' + err.message);
  });

function handleError(error, res, message) {
  console.error(error);
  res.status(500).json({ message });
}

// Middleware para tratamento de erros
app.use(errorHandler);

module.exports = app;