const { query, run } = require('../config/db');

// @desc    Get all products
// @route   GET /api/products
const getProducts = async (req, res) => {
    try {
        const products = await query(`
            SELECT p.*, s.supplier_name 
            FROM products p 
            LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
        `);
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
    try {
        const products = await query(`
            SELECT p.*, s.supplier_name 
            FROM products p 
            LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id 
            WHERE p.product_id = ?
        `, [req.params.id]);

        if (products.length > 0) {
            res.json({ success: true, data: products[0] });
        } else {
            res.status(404).json({ success: false, message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
const createProduct = async (req, res) => {
    const { name, category, price, quantity, supplierId, image, description } = req.body;

    try {
        const status = quantity > 0 ? 'In Stock' : 'Out of Stock';
        
        const result = await run(
            'INSERT INTO products (product_name, category, price, quantity, supplier_id, image, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, category, price, quantity, supplierId, image, status, description]
        );

        res.status(201).json({ success: true, data: { id: result.id } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
    const { name, category, price, quantity, supplierId, image, description } = req.body;
    
    try {
        const status = quantity > 0 ? (quantity < 10 ? 'Low Stock' : 'In Stock') : 'Out of Stock';

        const result = await run(
            'UPDATE products SET product_name = ?, category = ?, price = ?, quantity = ?, supplier_id = ?, image = ?, status = ?, description = ? WHERE product_id = ?',
            [name, category, price, quantity, supplierId, image, status, description, req.params.id]
        );

        if (result.changes > 0) {
            res.json({ success: true, message: 'Product updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
    try {
        const result = await run('DELETE FROM products WHERE product_id = ?', [req.params.id]);

        if (result.changes > 0) {
            res.json({ success: true, message: 'Product removed' });
        } else {
            res.status(404).json({ success: false, message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get distinct product categories
// @route   GET /api/products/categories
const getCategories = async (req, res) => {
    try {
        const rows = await query(
            'SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != "" ORDER BY category'
        );
        const fromDb = rows.map((r) => r.category);
        const defaults = ['Electronics', 'Accessories', 'Furniture', 'Supplies', 'Storage', 'Books', 'Clothing'];
        const categories = [...new Set([...fromDb, ...defaults])];
        res.json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories
};
