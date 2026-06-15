const express = require('express');
const router = express.Router();
const { getStocks, updateStock } = require('../controllers/stockController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getStocks);

router.route('/:id')
    .put(protect, updateStock);

module.exports = router;
