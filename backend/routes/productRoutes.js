const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getCategories } = require('../controllers/productController');
const { importImageFromUrl, saveImageData } = require('../controllers/imageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/categories', protect, getCategories);
router.post('/import-image-url', protect, importImageFromUrl);
router.post('/save-image-data', protect, saveImageData);

router.route('/')
    .get(protect, getProducts)
    .post(protect, createProduct);

router.route('/:id')
    .get(protect, getProductById)
    .put(protect, updateProduct)
    .delete(protect, deleteProduct);

module.exports = router;
