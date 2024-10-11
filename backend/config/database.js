const { Sequelize } = require('sequelize');
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

// Verifica se a URL do banco de dados foi carregada corretamente
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL não foi definida. Verifique seu arquivo .env.');
  process.exit(1); // Finaliza o processo se a URL do banco de dados não estiver definida
}

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
    console.error('Erro ao conectar ao banco de dados:', error.message);
    process.exit(1); // Finaliza o processo caso a conexão falhe
  }
})();

// Exporta o objeto Sequelize para ser usado em outros arquivos da aplicação
module.exports = sequelize;