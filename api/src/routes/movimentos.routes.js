const express = require('express');
const router = express.Router();
const { criarMovimento } = require('../controllers/movimentos.controller');

router.post('/', criarMovimento);

module.exports = router;
