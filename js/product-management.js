// Product Management page specific JavaScript

let currentPage = 1;
let itemsPerPage = 10;
let filteredProducts = [];
let allProducts = [];

document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
    populateFilters();
});

function setupEventListeners() {
    // Search input
    document.getElementById('searchInput').addEventListener('input', function() {
        filterProducts();
    });

    // Category filter
    document.getElementById('categoryFilter').addEventListener('change', function() {
        filterProducts();
    });

    // Add product form
    document.getElementById('addProductForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleAddProduct();
    });

    // Edit product form
    document.getElementById('editProductForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleUpdateProduct();
    });
}

async function loadProducts() {
    try {
        allProducts = await getProducts();
        filteredProducts = [...allProducts];
        renderProducts();
        updatePagination();
    } catch (error) {
        console.error("Error loading products:", error);
        if (typeof showToast === 'function') {
            showToast("Failed to load products: " + error.message, "error");
        }
    }
}

function fillDatalist(datalistId, categories) {
    const datalist = document.getElementById(datalistId);
    if (!datalist) return;
    datalist.innerHTML = '';
    categories.forEach((category) => {
        const option = document.createElement('option');
        option.value = category;
        datalist.appendChild(option);
    });
}

async function populateFilters() {
    const categories = await getCategories();
    const categoryFilter = document.getElementById('categoryFilter');

    categoryFilter.length = 1;
    categories.forEach((category) => {
        categoryFilter.appendChild(new Option(category, category));
    });

    fillDatalist('categoryList', categories);
    fillDatalist('editCategoryList', categories);

    // Populate suppliers
    const suppliers = await getSuppliers();
    const productSupplier = document.getElementById('productSupplier');
    const editProductSupplier = document.getElementById('editProductSupplier');

    suppliers.forEach(supplier => {
        const option1 = new Option(supplier.name, supplier.id);
        const option2 = new Option(supplier.name, supplier.id);

        productSupplier.appendChild(option1);
        editProductSupplier.appendChild(option2);
    });
}

function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;

    filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            product.category.toLowerCase().includes(searchTerm) ||
                            product.supplier.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || product.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    currentPage = 1;
    renderProducts();
    updatePagination();
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    filterProducts();
}

function renderProducts() {
    const tableBody = document.getElementById('productsTableBody');
    tableBody.innerHTML = '';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);

    productsToShow.forEach(product => {
        const row = document.createElement('tr');
        const imgUrl = getProductImageUrl(product.image);
        row.innerHTML = `
            <td>${product.id}</td>
            <td>
                <img src="${imgUrl}" alt="${product.name}" class="rounded product-thumb" style="width: 50px; height: 50px; object-fit: cover;" onerror="this.onerror=null;this.src=PRODUCT_IMAGE_PLACEHOLDER">
            </td>
            <td class="fw-bold">${product.name}</td>
            <td><span class="badge bg-secondary">${product.category}</span></td>
            <td>${formatCurrency(product.price)}</td>
            <td>${product.quantity}</td>
            <td>${product.supplier}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(product.status)}">${product.status}</span>
            </td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-outline-primary" onclick="editProduct(${product.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete(${product.id}, '${product.name}')" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    if (productsToShow.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="9" class="text-center py-4">
                <i class="bi bi-inbox fs-1 text-muted mb-2"></i>
                <p class="text-muted mb-0">No products found</p>
            </td>
        `;
        tableBody.appendChild(emptyRow);
    }
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'In Stock': return 'bg-success';
        case 'Low Stock': return 'bg-warning text-dark';
        case 'Out of Stock': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const pagination = document.getElementById('productsPagination');
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
    renderProducts();
    updatePagination();
}

async function handleAddProduct() {
    const form = document.getElementById('addProductForm');

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const productData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value.trim(),
        price: parseFloat(document.getElementById('productPrice').value),
        quantity: parseInt(document.getElementById('productQuantity').value),
        supplierId: parseInt(document.getElementById('productSupplier').value),
        image: getProductImageForSave(document.getElementById('productImage').value),
        description: document.getElementById('productDescription').value,
        status: getProductStatus(parseInt(document.getElementById('productQuantity').value))
    };

    try {
        await window.apiAddProduct(productData);

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
        modal.hide();
        form.reset();
        form.classList.remove('was-validated');

        // Reload products
        loadProducts();

        showToast('Product added successfully!', 'success');
    } catch(e) {
        showToast('Failed to add product: ' + e.message, 'error');
    }
}

async function editProduct(productId) {
    const product = await getProductById(productId);
    if (!product) return;

    // Populate edit form
    document.getElementById('editProductId').value = product.id;
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductCategory').value = product.category;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductQuantity').value = product.quantity;
    document.getElementById('editProductSupplier').value = (await getSuppliers()).find(s => s.name === product.supplier)?.id || '';
    document.getElementById('editProductImage').value = product.image || '';
    document.getElementById('editProductDescription').value = product.description || '';
    previewProductImage('editProductImage', 'editProductImagePreview');

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
    modal.show();
}

async function handleUpdateProduct() {
    const form = document.getElementById('editProductForm');

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const productId = parseInt(document.getElementById('editProductId').value);
    const productData = {
        name: document.getElementById('editProductName').value,
        category: document.getElementById('editProductCategory').value.trim(),
        price: parseFloat(document.getElementById('editProductPrice').value),
        quantity: parseInt(document.getElementById('editProductQuantity').value),
        supplierId: parseInt(document.getElementById('editProductSupplier').value),
        image: getProductImageForSave(document.getElementById('editProductImage').value),
        description: document.getElementById('editProductDescription').value,
        status: getProductStatus(parseInt(document.getElementById('editProductQuantity').value))
    };

    try {
        await window.apiUpdateProduct(productId, productData);

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
        modal.hide();
        form.reset();
        form.classList.remove('was-validated');

        // Reload products
        loadProducts();

        showToast('Product updated successfully!', 'success');
    } catch(e) {
        showToast('Failed to update product: ' + e.message, 'error');
    }
}

function confirmDelete(productId, productName) {
    document.getElementById('deleteProductName').textContent = productName;
    document.getElementById('confirmDeleteBtn').onclick = () => handleDeleteProduct(productId);

    const modal = new bootstrap.Modal(document.getElementById('deleteProductModal'));
    modal.show();
}

async function handleDeleteProduct(productId) {
    try {
        await window.apiDeleteProduct(productId);
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteProductModal'));
        modal.hide();

        // Reload products
        loadProducts();

        showToast('Product deleted successfully!', 'success');
    } catch (e) {
        showToast('Failed to delete product: ' + e.message, 'error');
    }
}

function getProductStatus(quantity) {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= 10) return 'Low Stock';
    return 'In Stock';
}

// Export functions for global use
window.editProduct = editProduct;
window.confirmDelete = confirmDelete;
window.changePage = changePage;
window.clearFilters = clearFilters;