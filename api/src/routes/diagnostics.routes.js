// api/src/routes/diagnostics.routes.js
const express = require('express');
const router = express.Router();
const { testDB, overview } = require('../controllers/diagnostics.controller');

router.get('/test-db', testDB);
router.get('/overview', overview);

module.exports = router;
