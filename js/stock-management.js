// Stock Management page specific JavaScript

let currentPage = 1;
let itemsPerPage = 10;
let filteredProducts = [];
let allProducts = [];

document.addEventListener('DOMContentLoaded', function() {
    loadStockData();
    setupEventListeners();
    loadCategories();
});

function setupEventListeners() {
    // Search input
    document.getElementById('searchInput').addEventListener('input', function() {
        filterProducts();
    });

    // Status filter
    document.getElementById('statusFilter').addEventListener('change', function() {
        filterProducts();
    });

    // Category filter
    document.getElementById('categoryFilter').addEventListener('change', function() {
        filterProducts();
    });

    // Update stock form
    document.getElementById('updateStockForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateStock();
    });
}

async function loadStockData() {
    try {
        allProducts = await getProducts();
        filteredProducts = [...allProducts];
        updateStockStats();
        renderStockTable();
        renderStockAlerts();
        updatePagination();
    } catch (error) {
        console.error("Error loading stock data:", error);
        if (typeof showToast === 'function') {
            showToast("Failed to load stock data: " + error.message, "error");
        }
    }
}

async function loadCategories() {
    const categories = await getCategories();
    const categoryFilter = document.getElementById('categoryFilter');

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function updateStockStats() {
    const stats = {
        total: allProducts.length,
        inStock: allProducts.filter(p => p.status === 'In Stock').length,
        lowStock: allProducts.filter(p => p.status === 'Low Stock').length,
        outOfStock: allProducts.filter(p => p.status === 'Out of Stock').length
    };

    document.getElementById('totalProducts').textContent = stats.total;
    document.getElementById('inStockProducts').textContent = stats.inStock;
    document.getElementById('lowStockProducts').textContent = stats.lowStock;
    document.getElementById('outOfStockProducts').textContent = stats.outOfStock;
}

function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;

    filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            product.supplier.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || product.status === statusFilter;
        const matchesCategory = !categoryFilter || product.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
    });

    currentPage = 1;
    renderStockTable();
    updatePagination();
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    filterProducts();
}

function renderStockTable() {
    const tableBody = document.getElementById('stockTableBody');
    tableBody.innerHTML = '';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);

    productsToShow.forEach(product => {
        const row = document.createElement('tr');
        const imgUrl = getProductImageUrl(product.image);
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <img src="${imgUrl}" alt="${product.name}" class="rounded me-2 product-thumb" style="width: 48px; height: 48px; object-fit: cover;" onerror="this.onerror=null;this.src=PRODUCT_IMAGE_PLACEHOLDER">
                    <div>
                        <div class="fw-bold">${product.name}</div>
                        <small class="text-muted">${formatCurrency(product.price)}</small>
                    </div>
                </div>
            </td>
            <td><span class="badge bg-secondary">${product.category}</span></td>
            <td>
                <span class="fw-bold ${getStockColor(product.quantity)}">${product.quantity}</span>
            </td>
            <td>10</td>
            <td>
                <span class="badge ${getStatusBadgeClass(product.status)}">${product.status}</span>
            </td>
            <td>${product.supplier}</td>
            <td>${formatDate(new Date().toISOString().split('T')[0])}</td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-outline-primary" onclick="openUpdateStockModal(${product.id})" title="Update Stock">
                        <i class="bi bi-plus-slash-minus"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="viewStockHistory(${product.id})" title="Stock History">
                        <i class="bi bi-clock-history"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    if (productsToShow.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="8" class="text-center py-4">
                <i class="bi bi-inbox fs-1 text-muted mb-2"></i>
                <p class="text-muted mb-0">No products found</p>
            </td>
        `;
        tableBody.appendChild(emptyRow);
    }
}

function getStockColor(quantity) {
    if (quantity === 0) return 'text-danger';
    if (quantity <= 10) return 'text-warning';
    return 'text-success';
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'In Stock': return 'bg-success';
        case 'Low Stock': return 'bg-warning text-dark';
        case 'Out of Stock': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

function renderStockAlerts() {
    const alertsContainer = document.getElementById('stockAlerts');
    alertsContainer.innerHTML = '';

    const lowStockProducts = allProducts.filter(p => p.status === 'Low Stock');
    const outOfStockProducts = allProducts.filter(p => p.status === 'Out of Stock');

    if (lowStockProducts.length > 0 || outOfStockProducts.length > 0) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-warning';
        alertDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <div>
                    <strong>Stock Alerts:</strong>
                    ${lowStockProducts.length > 0 ? `${lowStockProducts.length} products running low on stock. ` : ''}
                    ${outOfStockProducts.length > 0 ? `${outOfStockProducts.length} products are out of stock.` : ''}
                </div>
            </div>
        `;
        alertsContainer.appendChild(alertDiv);
    }
}

function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const pagination = document.getElementById('stockPagination');
    pagination.innerHTML = '';

    if (totalPages <= 1) return;

    // Previous button
    const prevBtn = document.createElement('li');
    prevBtn.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevBtn.innerHTML = `<a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Previous</a>`;
    pagination.appendChild(prevBtn);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            const pageBtn = document.createElement('li');
            pageBtn.className = `page-item ${i === currentPage ? 'active' : ''}`;
            pageBtn.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i})">${i}</a>`;
            pagination.appendChild(pageBtn);
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            const ellipsis = document.createElement('li');
            ellipsis.className = 'page-item disabled';
            ellipsis.innerHTML = '<span class="page-link">...</span>';
            pagination.appendChild(ellipsis);
        }
    }

    // Next button
    const nextBtn = document.createElement('li');
    nextBtn.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextBtn.innerHTML = `<a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Next</a>`;
    pagination.appendChild(nextBtn);
}

function changePage(page) {
    if (page < 1 || page > Math.ceil(filteredProducts.length / itemsPerPage)) return;
    currentPage = page;
    renderStockTable();
    updatePagination();
}

function openUpdateStockModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('updateProductId').value = product.id;
    document.getElementById('productNameDisplay').textContent = product.name;
    document.getElementById('currentStockDisplay').textContent = product.quantity;
    document.getElementById('stockAdjustment').value = 'add';
    document.getElementById('quantityChange').value = '';
    document.getElementById('stockNotes').value = '';

    const modal = new bootstrap.Modal(document.getElementById('updateStockModal'));
    modal.show();
}

async function updateStock() {
    const form = document.getElementById('updateStockForm');

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const productId = parseInt(document.getElementById('updateProductId').value, 10);
    const adjustmentType = document.getElementById('stockAdjustment').value;
    const quantityChange = parseInt(document.getElementById('quantityChange').value, 10);
    const notes = document.getElementById('stockNotes').value;

    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    let newQuantity = product.quantity;

    switch (adjustmentType) {
        case 'add':
            newQuantity += quantityChange;
            break;
        case 'set':
            newQuantity = quantityChange;
            break;
        case 'subtract':
            newQuantity = Math.max(0, product.quantity - quantityChange);
            break;
    }

    try {
        await window.apiUpdateStockLevel(productId, newQuantity);
        logStockChange(productId, adjustmentType, quantityChange, product.quantity, newQuantity, notes);

        const modal = bootstrap.Modal.getInstance(document.getElementById('updateStockModal'));
        modal.hide();
        form.reset();
        form.classList.remove('was-validated');

        await loadStockData();
        showToast('Stock updated successfully!', 'success');
    } catch (error) {
        showToast('Failed to update stock: ' + error.message, 'error');
    }
}

function logStockChange(productId, action, quantity, oldStock, newStock, notes) {
    const stockHistory = JSON.parse(localStorage.getItem('stockHistory') || '[]');

    const logEntry = {
        id: Date.now(),
        productId: productId,
        action: action,
        quantity: quantity,
        oldStock: oldStock,
        newStock: newStock,
        notes: notes,
        date: new Date().toISOString(),
        user: currentUser ? currentUser.name : 'System'
    };

    stockHistory.push(logEntry);
    localStorage.setItem('stockHistory', JSON.stringify(stockHistory));
}

function viewStockHistory(productId) {
    const product = getProductById(productId);
    if (!product) return;

    document.getElementById('historyProductName').textContent = `Stock History for ${product.name}`;

    const stockHistory = JSON.parse(localStorage.getItem('stockHistory') || '[]');
    const productHistory = stockHistory.filter(entry => entry.productId === productId);

    const historyBody = document.getElementById('stockHistoryBody');
    historyBody.innerHTML = '';

    if (productHistory.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="6" class="text-center py-3">
                <small class="text-muted">No stock changes recorded yet</small>
            </td>
        `;
        historyBody.appendChild(emptyRow);
    } else {
        productHistory.reverse().forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(entry.date)}</td>
                <td><span class="badge bg-info">${entry.action}</span></td>
                <td>${entry.quantity}</td>
                <td>${entry.oldStock}</td>
                <td>${entry.newStock}</td>
                <td><small>${entry.notes || '-'}</small></td>
            `;
            historyBody.appendChild(row);
        });
    }

    const modal = new bootstrap.Modal(document.getElementById('stockHistoryModal'));
    modal.show();
}

function getProductStatus(quantity) {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= 10) return 'Low Stock';
    return 'In Stock';
}

// Export functions for global use
window.openUpdateStockModal = openUpdateStockModal;
window.viewStockHistory = viewStockHistory;
window.changePage = changePage;
window.clearFilters = clearFilters;