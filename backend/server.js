const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const corretorRoutes = require('./routes/corretorRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const sequelize = require('./config/database');
const jwt = require('jsonwebtoken');
const Property = require('./models/Property');
const Favorite = require('./models/Favorite');
const { Op } = require('sequelize');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Carregar variáveis de ambiente
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

// Configurar CORS para permitir requisições do frontend
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// Middlewares
app.use(setContentTypeUTF8);
app.use(bodyParser.json({ type: 'application/json; charset=utf-8' }));
app.use(express.json());

// Configuração do multer para upload de imagens
const upload = multer({ storage: configureMulterStorage() });

// Função para configurar o cabeçalho UTF-8
function setContentTypeUTF8(req, res, next) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
}

// Função para configurar o armazenamento do multer
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

// Middleware de autenticação JWT
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

// Tratamento de erro do JWT
function handleJWTError(error, res) {
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Seu login expirou. Por favor, faça login novamente.' });
  }
  return res.status(401).json({ message: 'Erro ao verificar sua sessão. Tente novamente.' });
}

// Middleware para verificar o papel do usuário
function checkRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Você não tem permissão para realizar essa ação.' });
    }
    next();
  };
}

// Função para atualizar campos da propriedade
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

// Rotas de propriedades
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
}

// Outras rotas de propriedades (listar, atualizar, deletar)
app.get('/api/properties', async (req, res) => {
  try {
    const properties = await listProperties(req.query);
    res.json({ message: 'Imóveis listados com sucesso!', properties });
  } catch (error) {
    logger.error('Erro ao listar os imóveis: ' + error.message);
    handleError(error, res, 'Erro ao listar os imóveis.');
  }
});

// Função para listar propriedades
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

// Rota para atualizar propriedades
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

// Rota para deletar propriedades
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

// Usar rotas de autenticação e corretor
app.use('/api/auth', authRoutes);
app.use('/api/corretores', corretorRoutes);
app.use('/api/properties', propertyRoutes);

// Inicializar o servidor
sequelize.sync({ alter: true })
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch(err => {
    logger.error('Erro ao conectar ao banco de dados: ' + err.message);
  });

// Middleware para tratar erros
app.use(errorHandler);

function handleError(error, res, message) {
  console.error(error);
  res.status(500).json({ message });
}

module.exports = app;