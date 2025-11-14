const express = require('express');
const router = express.Router();
const { criarCartao, obterPorCodigo } = require('../controllers/cartoes.controller');

router.post('/', criarCartao);
router.get('/:codigo', obterPorCodigo);

module.exports = router;
