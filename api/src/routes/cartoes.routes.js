const express = require('express');
const router = express.Router();
const { criarCartao } = require('../controllers/cartoes.controller');

router.post('/', criarCartao);

module.exports = router;
