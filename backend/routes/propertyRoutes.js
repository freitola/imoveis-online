const express = require('express');
const { createProperty, updateProperty, deleteProperty, listProperties, getPropertyById } = require('../controllers/propertyController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole');

const router = express.Router();
const propertyController = require('../controllers/propertyController');

// Rotas para propriedades
router.post('/', authMiddleware, checkRole('corretor'), createProperty);
router.get('/', listProperties);
router.get('/:id', getPropertyById);
router.put('/:id', authMiddleware, checkRole('corretor'), updateProperty);
router.delete('/:id', authMiddleware, checkRole('corretor'), deleteProperty);
router.get('/featured', propertyController.getFeaturedProperties);

module.exports = router;