const { Sequelize } = require('sequelize');
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

// Verifique se a URL do banco de dados está sendo carregada corretamente
console.log('DATABASE_URL:', process.env.DATABASE_URL);

// Inicializa o Sequelize usando a URL de conexão do PostgreSQL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',   // Define o dialeto como PostgreSQL
  logging: false,        // Desativa o log de consultas SQL no console (opcional)
});

(async () => {
  try {
    // Tenta autenticar a conexão com o banco de dados
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados bem-sucedida!');
  } catch (error) {
    // Em caso de erro, exibe a mensagem de erro
    console.error('Erro ao conectar ao banco de dados:', error);
  }
})();

module.exports = sequelize;