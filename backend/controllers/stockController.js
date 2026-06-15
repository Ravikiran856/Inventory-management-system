const { query, run } = require('../config/db');

// @desc    Get all stocks
// @route   GET /api/stocks
const getStocks = async (req, res) => {
    try {
        const stocks = await query(`
            SELECT product_id, product_name, category, quantity, status 
            FROM products 
            ORDER BY quantity ASC
        `);
        res.json({ success: true, data: stocks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update stock level directly (manual override)
// @route   PUT /api/stocks/:id
const updateStock = async (req, res) => {
    const { quantity } = req.body;
    
    try {
        const newQuantity = parseInt(quantity, 10);
        const status = newQuantity > 0 ? (newQuantity < 10 ? 'Low Stock' : 'In Stock') : 'Out of Stock';

        const result = await run(
            'UPDATE products SET quantity = ?, status = ? WHERE product_id = ?',
            [newQuantity, status, req.params.id]
        );

        if (result.changes > 0) {
            res.json({ success: true, message: 'Stock updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getStocks,
    updateStock
};
