const express = require('express');
const router = express.Router();
const { registrarVoucher, confirmarVoucher } = require('../controllers/vouchers.controller');

router.post('/registrar', registrarVoucher); // opcional: registra pendente
router.post('/confirm', confirmarVoucher); // confirma e zera pontos

module.exports = router;
