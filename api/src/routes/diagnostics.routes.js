// api/src/routes/diagnostics.routes.js
const express = require('express');
const router = express.Router();
const { testDB } = require('../controllers/diagnostics.controller');

router.get('/test-db', testDB);

module.exports = router;
