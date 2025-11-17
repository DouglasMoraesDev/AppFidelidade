const express = require('express');
const router = express.Router();
const { criarCliente, buscar, listarPorEstabelecimento, deletarCliente } = require('../controllers/clientes.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/', authMiddleware, criarCliente);
router.get('/', authMiddleware, listarPorEstabelecimento);
router.get('/buscar', buscar);
router.delete('/:id', authMiddleware, deletarCliente);

module.exports = router;
