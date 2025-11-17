const express = require('express');
const router = express.Router();
const superAdminAuth = require('../middlewares/superAdmin.middleware');
const { listar, atualizar, remover, registrarPagamentoManual } = require('../controllers/superadmin.controller');

router.use(superAdminAuth);

router.get('/estabelecimentos', listar);
router.patch('/estabelecimentos/:id', atualizar);
router.delete('/estabelecimentos/:id', remover);
router.post('/estabelecimentos/:id/pagamentos', registrarPagamentoManual);

module.exports = router;

