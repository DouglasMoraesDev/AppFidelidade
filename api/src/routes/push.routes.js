const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth.middleware');
const { getPublicKey, subscribe, unsubscribe } = require('../controllers/push.controller');

// Obter chave pública VAPID
router.get('/public-key', verificarToken, getPublicKey);

// Registrar nova subscription
router.post('/subscribe', verificarToken, subscribe);

// Remover subscription
router.post('/unsubscribe', verificarToken, unsubscribe);

module.exports = router;
