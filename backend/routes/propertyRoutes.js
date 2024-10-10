const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole');
const propertyController = require('../controllers/propertyController');
const multer = require('multer');

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

// Rota para criar imóvel (somente corretores)
router.post('/properties', authMiddleware, checkRole('corretor'), upload.single('image'), propertyController.createProperty);

// Rota para listar imóveis
router.get('/properties', authMiddleware, propertyController.getProperties);

module.exports = router;