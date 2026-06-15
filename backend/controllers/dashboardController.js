const { query } = require('../config/db');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
const getDashboardStats = async (req, res) => {
    try {
        const productsCountResult = await query('SELECT COUNT(*) as count FROM products');
        const suppliersCountResult = await query('SELECT COUNT(*) as count FROM suppliers');
        const lowStockResult = await query('SELECT COUNT(*) as count FROM products WHERE quantity < 10 AND quantity > 0');
        const outOfStockResult = await query('SELECT COUNT(*) as count FROM products WHERE quantity = 0');
        const inventoryValueResult = await query('SELECT SUM(price * quantity) as total FROM products');

        res.json({
            success: true,
            data: {
                totalProducts: productsCountResult[0].count,
                totalSuppliers: suppliersCountResult[0].count,
                lowStockProducts: lowStockResult[0].count,
                outOfStockProducts: outOfStockResult[0].count,
                totalInventoryValue: inventoryValueResult[0].total || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Stock quantity by category (chart)
// @route   GET /api/dashboard/stock-by-category
const getStockByCategory = async (req, res) => {
    try {
        const rows = await query(`
            SELECT category, SUM(quantity) AS total
            FROM products
            GROUP BY category
            ORDER BY total DESC
        `);

        res.json({
            success: true,
            data: {
                labels: rows.map((r) => r.category),
                values: rows.map((r) => r.total || 0)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Low stock products for dashboard table
// @route   GET /api/dashboard/low-stock
const getLowStockProducts = async (req, res) => {
    try {
        const rows = await query(`
            SELECT product_id, product_name, category, quantity, status
            FROM products
            WHERE quantity < 10
            ORDER BY quantity ASC
            LIMIT 10
        `);

        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    All dashboard data in one request
// @route   GET /api/dashboard/overview
const getDashboardOverview = async (req, res) => {
    try {
        const productsCountResult = await query('SELECT COUNT(*) as count FROM products');
        const suppliersCountResult = await query('SELECT COUNT(*) as count FROM suppliers');
        const lowStockResult = await query('SELECT COUNT(*) as count FROM products WHERE quantity < 10 AND quantity > 0');
        const outOfStockResult = await query('SELECT COUNT(*) as count FROM products WHERE quantity = 0');
        const inventoryValueResult = await query('SELECT SUM(price * quantity) as total FROM products');

        const categoryRows = await query(`
            SELECT category, SUM(quantity) AS total
            FROM products
            GROUP BY category
            ORDER BY total DESC
        `);

        const lowStockRows = await query(`
            SELECT product_id, product_name, category, quantity, status
            FROM products
            WHERE quantity < 10
            ORDER BY quantity ASC
            LIMIT 10
        `);

        res.json({
            success: true,
            data: {
                stats: {
                    totalProducts: productsCountResult[0].count,
                    totalSuppliers: suppliersCountResult[0].count,
                    lowStockProducts: lowStockResult[0].count,
                    outOfStockProducts: outOfStockResult[0].count,
                    totalInventoryValue: inventoryValueResult[0].total || 0
                },
                stockByCategory: {
                    labels: categoryRows.map((r) => r.category),
                    values: categoryRows.map((r) => r.total || 0)
                },
                lowStock: lowStockRows
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getStockByCategory,
    getLowStockProducts,
    getDashboardOverview
};
