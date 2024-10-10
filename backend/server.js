const express = require('express');  // Importa o Express
const dotenv = require('dotenv');  // Importa o dotenv para carregar as variáveis de ambiente
const bodyParser = require('body-parser');  // Importa o body-parser para garantir UTF-8
const multer = require('multer');  // Importa o multer para upload de arquivos
const path = require('path');
const fs = require('fs');
const authRoutes = require('./routes/authRoutes');  // Importa as rotas de autenticação
const sequelize = require('./config/database');  // Importa a configuração do banco de dados
const jwt = require('jsonwebtoken');  // Importa o JWT para verificar tokens
const Property = require('./models/Property');  // Importa o modelo de Imóvel (Property)
const { Op } = require('sequelize');  // Importa operadores do Sequelize (necessário para os filtros)

dotenv.config();  // Carrega as variáveis de ambiente do arquivo .env

const app = express();  // Cria a instância do Express

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
    return res.status(401).json({ message: 'Acesso negado: token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Verifica e decodifica o token
    req.user = decoded;  // Adiciona os dados do usuário decodificado à requisição
    next();  // Passa para a próxima função
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado, por favor faça login novamente' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido' });
    }
    return res.status(401).json({ message: 'Falha na autenticação' });
  }
}

// Middleware para verificar o papel do usuário (cliente ou corretor)
function checkRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Acesso negado: você não tem permissão para acessar esta rota' });
    }
    next();
  };
}

// Middleware para decodificar corretamente a URL
app.use((req, res, next) => {
  if (req.query.location) {
    req.query.location = decodeURIComponent(req.query.location);  // Decodifica a localização corretamente
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
      return res.status(400).json({ message: 'O título é obrigatório e deve ser uma string.' });
    }
    if (!price || isNaN(price) || price <= 0) {
      return res.status(400).json({ message: 'O preço é obrigatório e deve ser um número positivo.' });
    }
    if (!location || typeof location !== 'string') {
      return res.status(400).json({ message: 'A localização é obrigatória e deve ser uma string.' });
    }
    if (bedrooms === undefined || isNaN(bedrooms) || bedrooms < 0) {
      return res.status(400).json({ message: 'O número de quartos deve ser um número inteiro não negativo.' });
    }
    if (bathrooms === undefined || isNaN(bathrooms) || bathrooms < 0) {
      return res.status(400).json({ message: 'O número de banheiros deve ser um número inteiro não negativo.' });
    }
    if (size === undefined || isNaN(size) || size <= 0) {
      return res.status(400).json({ message: 'O tamanho deve ser um número positivo.' });
    }
    if (!type || typeof type !== 'string') {
      return res.status(400).json({ message: 'O tipo de imóvel é obrigatório e deve ser uma string.' });
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
      image: imagePath,  // Salva o caminho da imagem
      createdBy: req.user.id  // ID do corretor que criou o imóvel
    });

    res.json({ message: 'Imóvel criado com sucesso', property: newProperty });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar imóvel' });
  }
});

// Rota para listar todos os imóveis com filtros e paginação
app.get('/api/properties', authMiddleware, async (req, res) => {
  try {
    // Captura os filtros da query string
    const { minPrice, maxPrice, location, bedrooms, minSize, maxSize, type, bathrooms, page = 1, limit = 10 } = req.query;

    const whereClause = {};  // Inicializa o objeto de cláusulas 'where'

    // Filtro de preço mínimo e máximo
    if (minPrice) whereClause.price = { [Op.gte]: parseFloat(minPrice) };
    if (maxPrice) whereClause.price = { ...whereClause.price, [Op.lte]: parseFloat(maxPrice) };

    // Filtro de localização
    if (location) whereClause.location = { [Op.iLike]: `%${location}%` };

    // Filtro de quartos
    if (bedrooms) whereClause.bedrooms = parseInt(bedrooms);

    // Filtro de tamanho mínimo e máximo
    if (minSize) whereClause.size = { [Op.gte]: parseFloat(minSize) };
    if (maxSize) whereClause.size = { ...whereClause.size, [Op.lte]: parseFloat(maxSize) };

    // Filtro de tipo de imóvel
    if (type) whereClause.type = { [Op.iLike]: `%${type}%` };

    // Filtro de banheiros
    if (bathrooms) whereClause.bathrooms = parseInt(bathrooms);

    // Calcular o offset para a paginação
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Busca os imóveis no banco de dados com base nos filtros e adiciona a paginação
    const properties = await Property.findAll({
      where: whereClause,
      limit: parseInt(limit),  // Limita o número de resultados por página
      offset: offset,          // Define o deslocamento (offset) para os resultados
    });

    // Retorna a lista de imóveis filtrada com paginação
    res.json({ message: 'Lista de imóveis', properties, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error(error);  // Exibe o erro no console para depuração
    res.status(500).json({ message: 'Erro ao listar imóveis' });
  }
});

// Rota para atualizar um imóvel (apenas corretores)
app.put('/api/properties/:id', authMiddleware, checkRole('corretor'), async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({ message: 'Imóvel não encontrado' });
    }

    // Atualiza os dados do imóvel
    updatePropertyFields(property, req.body);

    // Salva as mudanças
    await property.save();

    res.json({ message: 'Imóvel atualizado com sucesso', property });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar imóvel' });
  }
});

// Rota para excluir um imóvel (apenas corretores)
app.delete('/api/properties/:id', authMiddleware, checkRole('corretor'), async (req, res) => {
  try {
    const { id } = req.params;

    // Busca o imóvel pelo ID
    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({ message: 'Imóvel não encontrado' });
    }

    // Exclui o imóvel
    await property.destroy();

    res.json({ message: 'Imóvel excluído com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao excluir imóvel' });
  }
});

// Rota para servir as imagens estáticas
app.use('/uploads', express.static('uploads'));

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