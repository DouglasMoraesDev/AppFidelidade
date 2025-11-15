// api/src/routes/estabelecimentos.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: path.join(__dirname, '..', '..', 'img') });

const { criarEstabelecimento, me } = require('../controllers/estabelecimentos.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// criar estabelecimento (public)
router.post('/', upload.single('logo'), criarEstabelecimento);

// rota protegida para retornar estabelecimento do token
router.get('/me', authMiddleware, me);

module.exports = router;
