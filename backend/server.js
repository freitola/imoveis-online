const express = require('express');  // Importa o Express
const dotenv = require('dotenv');  // Importa o dotenv para carregar as variáveis de ambiente
const bodyParser = require('body-parser');  // Importa o body-parser para garantir UTF-8
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

// Rota de autenticação
app.use('/api', authRoutes);

// Função para atualizar campos de imóveis de forma genérica
function updatePropertyFields(property, data) {
  property.title = data.title || property.title;
  property.price = data.price || property.price;
  property.location = data.location || property.location;
  property.size = data.size || property.size;
  property.bedrooms = data.bedrooms || property.bedrooms;
  property.bathrooms = data.bathrooms || property.bathrooms;
  return property;
}

// Rota de criação de imóveis (apenas corretores)
app.post('/api/properties', authMiddleware, checkRole('corretor'), async (req, res) => {
  try {
    const { title, price, location } = req.body;

    // Salva o imóvel no banco de dados, com o corretor que o criou
    const newProperty = await Property.create({
      title,
      price,
      location,
      createdBy: req.user.id  // ID do corretor que criou o imóvel
    });

    res.json({ message: 'Imóvel criado com sucesso', property: newProperty });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar imóvel' });
  }
});

// Rota para listar todos os imóveis com filtros de preço, localização, quartos, tamanho e tipo
app.get('/api/properties', authMiddleware, async (req, res) => {
  try {
    // Captura os filtros da query string
    const { minPrice, maxPrice, location, bedrooms, minSize, maxSize, type, bathrooms } = req.query;

    const whereClause = {};  // Inicializa o objeto de cláusulas 'where'

    // Exibe o valor da localização para depuração
    console.log("Valor de location recebido:", location);

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

    // Busca os imóveis no banco de dados com base nos filtros
    const properties = await Property.findAll({
      where: whereClause
    });

    // Retorna a lista de imóveis filtrada
    res.json({ message: 'Lista de imóveis', properties });
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