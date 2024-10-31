const express = require('express');
const { fetchAndStoreTransactions, queryTransactions } = require('../controllers/trackerController');

const router = express.Router();

router.get('/fetch/:address', fetchAndStoreTransactions);
router.get('/query', queryTransactions);

module.exports = router;