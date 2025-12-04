const express = require('express');
const router = express.Router();
const superAdminAuth = require('../middlewares/superAdmin.middleware');
const { 
  listar, 
  atualizar, 
  remover, 
  registrarPagamentoManual,
  resetarSenha,
  alterarStatus,
  enviarNotificacao,
  enviarNotificacaoGlobal
} = require('../controllers/superadmin.controller');

router.use(superAdminAuth);

router.get('/estabelecimentos', listar);
router.patch('/estabelecimentos/:id', atualizar);
router.delete('/estabelecimentos/:id', remover);
router.post('/estabelecimentos/:id/pagamentos', registrarPagamentoManual);
router.post('/estabelecimentos/:id/resetar-senha', resetarSenha);
router.patch('/estabelecimentos/:id/status', alterarStatus);
router.post('/estabelecimentos/:id/notificacao', enviarNotificacao);
router.post('/notificacao-global', enviarNotificacaoGlobal);

module.exports = router;

