const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getStockByCategory,
    getLowStockProducts,
    getDashboardOverview
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/overview', protect, getDashboardOverview);
router.get('/stats', protect, getDashboardStats);
router.get('/stock-by-category', protect, getStockByCategory);
router.get('/low-stock', protect, getLowStockProducts);

module.exports = router;
