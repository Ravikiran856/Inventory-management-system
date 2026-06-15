const fs = require('fs');
const path = require('path');

const jsDir = path.join(__dirname, '../frontend/js');

function replaceInFile(fileName, replacements) {
    const filePath = path.join(jsDir, fileName);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;
    
    for (const {from, to} of replacements) {
        content = content.replace(from, to);
    }
    
    if (original !== content) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${fileName}`);
    }
}

// dashboard.js
replaceInFile('dashboard.js', [
    { from: 'function loadDashboardData() {', to: 'async function loadDashboardData() {' },
    { from: 'const stats = getStats();', to: 'const stats = await getStats();' },
    { from: 'const products = getProducts();', to: 'const products = await getProducts();' }
]);

// product-management.js
replaceInFile('product-management.js', [
    { from: 'function loadProducts() {', to: 'async function loadProducts() {' },
    { from: 'allProducts = getProducts();', to: 'allProducts = await getProducts();' },
    { from: 'function populateFilters() {', to: 'async function populateFilters() {' },
    { from: 'const suppliers = getSuppliers();', to: 'const suppliers = await getSuppliers();' },
    { from: 'function addProduct() {', to: 'async function addProduct() {' },
    { from: 'const newProduct = addProduct(productData);', to: 'const newProduct = await window.addProduct(productData);' },
    { from: 'function editProduct(productId) {', to: 'async function editProduct(productId) {' },
    { from: 'const product = getProductById(productId);', to: 'const product = await getProductById(productId);' },
    { from: 'getSuppliers().find', to: '(await getSuppliers()).find' },
    { from: 'function updateProduct() {', to: 'async function updateProduct() {' },
    { from: 'const updatedProduct = updateProduct(productId, productData);', to: 'const updatedProduct = await window.updateProduct(productId, productData);' },
    { from: 'function deleteProduct(productId) {', to: 'async function deleteProduct(productId) {' },
    { from: 'if (deleteProduct(productId)) {', to: 'try { await window.deleteProduct(productId);' },
    { from: 'showToast(\'Product deleted successfully!\', \'success\');\n    } else {\n        showToast(\'Failed to delete product\', \'error\');\n    }', to: 'showToast(\'Product deleted successfully!\', \'success\');\n    } catch (e) {\n        showToast(\'Failed to delete product: \' + e.message, \'error\');\n    }' }
]);

// supplier-management.js
replaceInFile('supplier-management.js', [
    { from: 'function loadSuppliers() {', to: 'async function loadSuppliers() {' },
    { from: 'allSuppliers = getSuppliers();', to: 'allSuppliers = await getSuppliers();' },
    { from: 'function addSupplier() {', to: 'async function addSupplier() {' },
    { from: 'const newSupplier = addSupplier(supplierData);', to: 'const newSupplier = await window.addSupplier(supplierData);' },
    { from: 'function editSupplier(supplierId) {', to: 'async function editSupplier(supplierId) {' },
    { from: 'const supplier = getSupplierById(supplierId);', to: 'const supplier = await getSupplierById(supplierId);' },
    { from: 'function updateSupplier() {', to: 'async function updateSupplier() {' },
    { from: 'const updatedSupplier = updateSupplier(supplierId, supplierData);', to: 'const updatedSupplier = await window.updateSupplier(supplierId, supplierData);' },
    { from: 'function deleteSupplier(supplierId) {', to: 'async function deleteSupplier(supplierId) {' },
    { from: 'if (deleteSupplier(supplierId)) {', to: 'try { await window.deleteSupplier(supplierId);' },
    { from: 'showToast(\'Supplier deleted successfully!\', \'success\');\n    } else {\n        showToast(\'Failed to delete supplier\', \'error\');\n    }', to: 'showToast(\'Supplier deleted successfully!\', \'success\');\n    } catch (e) {\n        showToast(\'Failed to delete supplier: \' + e.message, \'error\');\n    }' }
]);

// sales-management.js
replaceInFile('sales-management.js', [
    { from: 'function loadSales() {', to: 'async function loadSales() {' },
    { from: 'allSales = getSales();', to: 'allSales = await getSales();' },
    { from: 'function populateProductsDropdown() {', to: 'async function populateProductsDropdown() {' },
    { from: 'const products = getProducts();', to: 'const products = await getProducts();' },
    { from: 'function addSale() {', to: 'async function addSale() {' },
    { from: 'const newSale = addSale(saleData);', to: 'const newSale = await window.addSale(saleData);' },
    { from: 'const product = getProductById(productId);', to: 'const product = await getProductById(productId);' }
]);

// purchase-management.js
replaceInFile('purchase-management.js', [
    { from: 'function loadPurchases() {', to: 'async function loadPurchases() {' },
    { from: 'allPurchases = getPurchases();', to: 'allPurchases = await getPurchases();' },
    { from: 'function populateDropdowns() {', to: 'async function populateDropdowns() {' },
    { from: 'const products = getProducts();', to: 'const products = await getProducts();' },
    { from: 'const suppliers = getSuppliers();', to: 'const suppliers = await getSuppliers();' },
    { from: 'function addPurchase() {', to: 'async function addPurchase() {' },
    { from: 'const newPurchase = addPurchase(purchaseData);', to: 'const newPurchase = await window.addPurchase(purchaseData);' }
]);

// stock-management.js
replaceInFile('stock-management.js', [
    { from: 'function loadStock() {', to: 'async function loadStock() {' },
    { from: 'allProducts = getProducts();', to: 'allProducts = await getProducts();' },
    { from: 'function populateCategories() {', to: 'async function populateCategories() {' }
]);

// login.js
replaceInFile('login.js', [
    { from: 'function handleLogin(e) {', to: 'async function handleLogin(e) {' },
    { from: 'if (login(username, password, remember)) {', to: 'try { const res = await window.loginUser(username, password); localStorage.setItem("token", res.token); localStorage.setItem("rememberedUser", JSON.stringify(res.user)); showToast("Login successful!", "success"); setTimeout(() => { window.location.href = "pages/dashboard.html"; }, 1000); } catch(e) { showToast(e.message, "error"); if(false) {' }
]);

// main.js
replaceInFile('main.js', [
    { from: 'function logout() {', to: 'function logout() { localStorage.removeItem("token");' }
]);

console.log('Refactoring complete.');
