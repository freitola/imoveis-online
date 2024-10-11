const express = require('express');
const { getCorretores, getCorretorById, createCorretor, updateCorretor, deleteCorretor } = require('../controllers/corretorController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole');

const router = express.Router();

// Rotas protegidas por autenticação e role corretor
router.get('/', authMiddleware, checkRole('admin'), getCorretores); // Somente admin pode listar corretores
router.get('/:id', authMiddleware, checkRole('admin'), getCorretorById);
router.post('/', authMiddleware, checkRole('admin'), createCorretor);
router.put('/:id', authMiddleware, checkRole('admin'), updateCorretor);
router.delete('/:id', authMiddleware, checkRole('admin'), deleteCorretor);

module.exports = router;