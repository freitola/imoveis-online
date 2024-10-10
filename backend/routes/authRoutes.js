const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();

// Rotas de autenticação
router.post('/register', register);
router.post('/login', login);

module.exports = router;