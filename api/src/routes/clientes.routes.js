const express = require('express');
const router = express.Router();
const { criarCliente, buscar, listarPorEstabelecimento, atualizarCliente, deletarCliente } = require('../controllers/clientes.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/', authMiddleware, criarCliente);
router.get('/', authMiddleware, listarPorEstabelecimento);
router.put('/:id', authMiddleware, atualizarCliente);
router.get('/buscar', buscar);
router.delete('/:id', authMiddleware, deletarCliente);

module.exports = router;
