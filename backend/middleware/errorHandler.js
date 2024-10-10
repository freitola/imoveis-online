// middleware/errorHandler.js
const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  // Log the error
  logger.error(err.message, { stack: err.stack });

  // Enviar resposta de erro para o cliente
  res.status(500).json({ message: 'Ocorreu um erro no servidor. Tente novamente mais tarde.' });
}

module.exports = errorHandler;