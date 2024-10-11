const express = require('express');
const router = express.Router();
const { login, register, deleteUser } = require('../controllers/authController'); // Certifique-se de que as funções estão importadas
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole');

// Rota POST para login
router.post('/login', login);

// Rota POST para registro
router.post('/register', register);

// Rota DELETE para deletar um usuário - Somente Admin pode deletar usuários
router.delete('/users/:id', authMiddleware, checkRole('admin'), deleteUser);

module.exports = router;