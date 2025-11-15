const express = require('express');
const router = express.Router();
const { criarCliente, buscar } = require('../controllers/clientes.controller');

router.post('/', criarCliente);
router.get('/buscar', buscar);

module.exports = router;
