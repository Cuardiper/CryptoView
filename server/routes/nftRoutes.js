const express = require('express');
const { fetchAndStoreNFTMetadata } = require('../controllers/nftController');

const router = express.Router();

router.get('/:contractAddress/:tokenId', fetchAndStoreNFTMetadata);

module.exports = router;