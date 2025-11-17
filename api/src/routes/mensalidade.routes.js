const express = require('express');
const router = express.Router();
const { confirmarMensalidade } = require('../controllers/mensalidade.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/confirmar', authMiddleware, confirmarMensalidade);

module.exports = router;

