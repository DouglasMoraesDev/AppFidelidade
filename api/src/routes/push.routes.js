const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const pushController = require('../controllers/push.controller');

// Obter chave pública VAPID
router.get('/public-key', verificarToken, pushController.getPublicKey);

// Registrar nova subscription
router.post('/subscribe', verificarToken, pushController.subscribe);

// Remover subscription
router.post('/unsubscribe', verificarToken, pushController.unsubscribe);

module.exports = router;
