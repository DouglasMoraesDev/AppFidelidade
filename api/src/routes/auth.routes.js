const express = require('express');
const router = express.Router();
const { login, alterarSenha } = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/login', login);
router.patch('/password', authMiddleware, alterarSenha);

module.exports = router;
