const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: path.join(__dirname, '..', '..', 'img') });

const {
  criarEstabelecimento,
  me,
  snapshot,
  backup,
  atualizarConfiguracoes,
  atualizarLogo
} = require('../controllers/estabelecimentos.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/', upload.single('logo'), criarEstabelecimento);
router.get('/me', authMiddleware, me);
router.get('/me/snapshot', authMiddleware, snapshot);
router.get('/me/backup', authMiddleware, backup);
router.patch('/me/config', authMiddleware, atualizarConfiguracoes);
router.patch('/me/logo', authMiddleware, upload.single('logo'), atualizarLogo);

module.exports = router;
