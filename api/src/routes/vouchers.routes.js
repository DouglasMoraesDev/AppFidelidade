const express = require('express');
const router = express.Router();
const { enviarVoucher } = require('../controllers/vouchers.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/enviar', authMiddleware, enviarVoucher);

module.exports = router;
