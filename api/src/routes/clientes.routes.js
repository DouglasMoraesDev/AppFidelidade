const express = require('express');
const router = express.Router();
const { listarClientes, criarCliente, buscarPorNomeTelefone } = require('../controllers/clientes.controller');

router.get('/', listarClientes);
router.post('/', criarCliente);
router.get('/buscar', buscarPorNomeTelefone);

module.exports = router;
