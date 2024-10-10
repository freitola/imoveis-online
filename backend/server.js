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
const { Op } = require('sequelize');

// Importa o modelo de Favoritos
const Favorite = require('./models/Favorite');

dotenv.config();

const app = express();

// Middleware para garantir que as requisições e respostas estejam com UTF-8
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Middleware para parsing do corpo das requisições (JSON) e garantindo codificação UTF-8
app.use(bodyParser.json({ type: 'application/json; charset=utf-8' }));
app.use(express.json());

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);  // Cria a pasta 'uploads' se não existir
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));  // Nomeia o arquivo com um timestamp único
  }
});

const upload = multer({ storage: storage });

// Middleware para verificar o token JWT
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
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Seu login expirou. Por favor, faça login novamente.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Login inválido. Tente novamente.' });
    }
    return res.status(401).json({ message: 'Erro ao verificar sua sessão. Tente novamente.' });
  }
}

// Middleware para verificar o papel do usuário (cliente ou corretor)
function checkRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Você não tem permissão para realizar essa ação.' });
    }
    next();
  };
}

// Middleware para decodificar corretamente a URL
app.use((req, res, next) => {
  if (req.query.location) {
    req.query.location = decodeURIComponent(req.query.location);
  }
  next();
});

// Função para atualizar campos de imóveis de forma genérica
function updatePropertyFields(property, data) {
  property.title = data.title || property.title;
  property.price = data.price || property.price;
  property.location = data.location || property.location;
  property.size = data.size || property.size;
  property.bedrooms = data.bedrooms || property.bedrooms;
  property.bathrooms = data.bathrooms || property.bathrooms;
  property.image = data.image || property.image;  // Adiciona o campo de imagem
  return property;
}

// Rota de criação de imóveis (apenas corretores)
app.post('/api/properties', authMiddleware, checkRole('corretor'), upload.single('image'), async (req, res) => {
  try {
    const { title, price, location, bedrooms, bathrooms, size, type } = req.body;

    // Validação simples de dados
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ message: 'O título do imóvel é obrigatório.' });
    }
    if (!price || isNaN(price) || price <= 0) {
      return res.status(400).json({ message: 'Informe um preço válido para o imóvel.' });
    }
    if (!location || typeof location !== 'string') {
      return res.status(400).json({ message: 'A localização do imóvel é obrigatória.' });
    }
    if (bedrooms === undefined || isNaN(bedrooms) || bedrooms < 0) {
      return res.status(400).json({ message: 'O número de quartos deve ser um valor válido.' });
    }
    if (bathrooms === undefined || isNaN(bathrooms) || bathrooms < 0) {
      return res.status(400).json({ message: 'O número de banheiros deve ser um valor válido.' });
    }
    if (size === undefined || isNaN(size) || size <= 0) {
      return res.status(400).json({ message: 'Informe um tamanho válido para o imóvel.' });
    }
    if (!type || typeof type !== 'string') {
      return res.status(400).json({ message: 'O tipo de imóvel é obrigatório.' });
    }

    // Salva o caminho da imagem se ela foi enviada
    const imagePath = req.file ? req.file.path : null;

    // Salva o imóvel no banco de dados, com o corretor que o criou
    const newProperty = await Property.create({
      title,
      price,
      location,
      bedrooms,
      bathrooms,
      size,
      type,
      image: imagePath,  // Adiciona o caminho da imagem
      createdBy: req.user.id  // ID do corretor que criou o imóvel
    });

    res.json({ message: 'Imóvel cadastrado com sucesso!', property: newProperty });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao cadastrar o imóvel. Tente novamente mais tarde.' });
  }
});

// Rota para listar todos os imóveis com filtros avançados e ordenação
app.get('/api/properties', authMiddleware, async (req, res) => {
  try {
    const {
      minPrice,
      maxPrice,
      location,
      bedrooms,
      minSize,
      maxSize,
      type,
      bathrooms,
      page = 1,
      limit = 10,
      orderBy = 'price',
      orderDirection = 'ASC',
      filterLogic = 'AND'
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

    const filterLogicOp = filterLogic.toUpperCase() === 'OR' ? Op.or : Op.and;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const properties = await Property.findAll({
      where: { [filterLogicOp]: whereClause },
      limit: parseInt(limit),
      offset: offset,
      order: orderOptions
    });

    res.json({ message: 'Imóveis listados com sucesso!', properties, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao listar os imóveis. Tente novamente mais tarde.' });
  }
});

// Rota para atualizar um imóvel (apenas corretores)
app.put('/api/properties/:id', authMiddleware, checkRole('corretor'), async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({ message: 'Imóvel não encontrado.' });
    }

    updatePropertyFields(property, req.body);

    await property.save();

    res.json({ message: 'Imóvel atualizado com sucesso!', property });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar o imóvel. Tente novamente mais tarde.' });
  }
});

// Rota para excluir um imóvel (apenas corretores)
app.delete('/api/properties/:id', authMiddleware, checkRole('corretor'), async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({ message: 'Imóvel não encontrado.' });
    }

    await property.destroy();

    res.json({ message: 'Imóvel removido com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao remover o imóvel. Tente novamente mais tarde.' });
  }
});

// Rota para adicionar um imóvel aos favoritos
app.post('/api/favorites', authMiddleware, async (req, res) => {
  try {
    const { propertyId } = req.body;

    const property = await Property.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Imóvel não encontrado.' });
    }

    const existingFavorite = await Favorite.findOne({
      where: { userId: req.user.id, propertyId }
    });

    if (existingFavorite) {
      return res.status(400).json({ message: 'Este imóvel já está na sua lista de favoritos.' });
    }

    const favorite = await Favorite.create({
      userId: req.user.id,
      propertyId
    });

    res.json({ message: 'Imóvel adicionado aos favoritos!', favorite });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao adicionar o imóvel aos favoritos. Tente novamente mais tarde.' });
  }
});

// Rota para listar todos os imóveis favoritos do usuário
app.get('/api/favorites', authMiddleware, async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { userId: req.user.id },
      include: [Property]  // Incluir os detalhes dos imóveis associados
    });

    res.json({ message: 'Seus imóveis favoritos foram carregados com sucesso!', favorites });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao carregar seus favoritos. Tente novamente mais tarde.' });
  }
});

// Rota para remover um imóvel dos favoritos
app.delete('/api/favorites/:propertyId', authMiddleware, async (req, res) => {
  try {
    const { propertyId } = req.params;

    const favorite = await Favorite.findOne({
      where: { userId: req.user.id, propertyId }
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Este imóvel não está na sua lista de favoritos.' });
    }

    await favorite.destroy();

    res.json({ message: 'Imóvel removido dos favoritos!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao remover o imóvel dos favoritos. Tente novamente mais tarde.' });
  }
});

// Rota de autenticação
app.use('/api', authRoutes);

// Conectar ao banco de dados e iniciar o servidor
const PORT = process.env.PORT || 5001;

sequelize.sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Erro ao conectar ao banco de dados:', err);
  });