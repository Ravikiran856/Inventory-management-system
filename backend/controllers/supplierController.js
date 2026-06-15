const { query, run } = require('../config/db');

// @desc    Get all suppliers
// @route   GET /api/suppliers
const getSuppliers = async (req, res) => {
    try {
        const suppliers = await query('SELECT * FROM suppliers');
        res.json({ success: true, data: suppliers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
const getSupplierById = async (req, res) => {
    try {
        const suppliers = await query('SELECT * FROM suppliers WHERE supplier_id = ?', [req.params.id]);

        if (suppliers.length > 0) {
            res.json({ success: true, data: suppliers[0] });
        } else {
            res.status(404).json({ success: false, message: 'Supplier not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a supplier
// @route   POST /api/suppliers
const createSupplier = async (req, res) => {
    const { name, contact, email, phone, address } = req.body;

    try {
        const result = await run(
            'INSERT INTO suppliers (supplier_name, contact_name, email, contact_number, address) VALUES (?, ?, ?, ?, ?)',
            [name, contact, email, phone, address]
        );

        res.status(201).json({ success: true, data: { id: result.id } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a supplier
// @route   PUT /api/suppliers/:id
const updateSupplier = async (req, res) => {
    const { name, contact, email, phone, address } = req.body;
    
    try {
        const result = await run(
            'UPDATE suppliers SET supplier_name = ?, contact_name = ?, email = ?, contact_number = ?, address = ? WHERE supplier_id = ?',
            [name, contact, email, phone, address, req.params.id]
        );

        if (result.changes > 0) {
            res.json({ success: true, message: 'Supplier updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Supplier not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a supplier
// @route   DELETE /api/suppliers/:id
const deleteSupplier = async (req, res) => {
    try {
        const result = await run('DELETE FROM suppliers WHERE supplier_id = ?', [req.params.id]);

        if (result.changes > 0) {
            res.json({ success: true, message: 'Supplier removed' });
        } else {
            res.status(404).json({ success: false, message: 'Supplier not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
};
