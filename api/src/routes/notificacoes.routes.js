const express = require('express');
const router = express.Router();
const notificacoesController = require('../controllers/notificacoes.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// GET /api/notificacoes - Lista notificações
router.get('/', notificacoesController.listar);

// GET /api/notificacoes/nao-lidas/count - Conta notificações não lidas
router.get('/nao-lidas/count', notificacoesController.contarNaoLidas);

// PATCH /api/notificacoes/marcar-todas-lidas - Marca todas como lidas
router.patch('/marcar-todas-lidas', notificacoesController.marcarTodasLidas);

// PATCH /api/notificacoes/:id/marcar-lida - Marca uma notificação como lida
router.patch('/:id/marcar-lida', notificacoesController.marcarLida);

module.exports = router;
