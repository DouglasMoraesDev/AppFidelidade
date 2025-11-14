const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: path.join(__dirname, '..', '..', 'img') });

const {
  criarEstabelecimento
} = require('../controllers/estabelecimentos.controller');

router.post('/', upload.single('logo'), criarEstabelecimento);

module.exports = router;
