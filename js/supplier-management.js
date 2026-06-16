// Supplier Management page specific JavaScript

let currentPage = 1;
let itemsPerPage = 10;
let filteredSuppliers = [];
let allSuppliers = [];

document.addEventListener('DOMContentLoaded', function() {
    loadSuppliers();
    setupEventListeners();
});

function setupEventListeners() {
    // Search input
    document.getElementById('searchInput').addEventListener('input', function() {
        filterSuppliers();
    });

    // Add supplier form
    document.getElementById('addSupplierForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleAddSupplier();
    });

    // Edit supplier form
    document.getElementById('editSupplierForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleUpdateSupplier();
    });
}

async function loadSuppliers() {
    try {
        allSuppliers = await getSuppliers();
        filteredSuppliers = [...allSuppliers];
        renderSuppliers();
        updatePagination();
    } catch (error) {
        console.error("Error loading suppliers:", error);
        if (typeof showToast === 'function') {
            showToast("Failed to load suppliers: " + error.message, "error");
        }
    }
}

function filterSuppliers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    filteredSuppliers = allSuppliers.filter(supplier => {
        return supplier.name.toLowerCase().includes(searchTerm) ||
               supplier.contact.toLowerCase().includes(searchTerm) ||
               supplier.email.toLowerCase().includes(searchTerm) ||
               supplier.phone.includes(searchTerm) ||
               supplier.address.toLowerCase().includes(searchTerm);
    });

    currentPage = 1;
    renderSuppliers();
    updatePagination();
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    filterSuppliers();
}

function renderSuppliers() {
    const tableBody = document.getElementById('suppliersTableBody');
    tableBody.innerHTML = '';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const suppliersToShow = filteredSuppliers.slice(startIndex, endIndex);

    suppliersToShow.forEach(supplier => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${supplier.id}</td>
            <td class="fw-bold">${supplier.name}</td>
            <td>${supplier.contact}</td>
            <td><a href="mailto:${supplier.email}" class="text-decoration-none">${supplier.email}</a></td>
            <td><a href="tel:${supplier.phone}" class="text-decoration-none">${supplier.phone}</a></td>
            <td class="text-truncate" style="max-width: 200px;" title="${supplier.address}">${supplier.address}</td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-outline-primary" onclick="editSupplier(${supplier.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete(${supplier.id}, '${supplier.name}')" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    if (suppliersToShow.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="7" class="text-center py-4">
                <i class="bi bi-inbox fs-1 text-muted mb-2"></i>
                <p class="text-muted mb-0">No suppliers found</p>
            </td>
        `;
        tableBody.appendChild(emptyRow);
    }
}

function updatePagination() {
    const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
    const pagination = document.getElementById('suppliersPagination');
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
    if (page < 1 || page > Math.ceil(filteredSuppliers.length / itemsPerPage)) return;
    currentPage = page;
    renderSuppliers();
    updatePagination();
}

async function handleAddSupplier() {
    const form = document.getElementById('addSupplierForm');

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const supplierData = {
        name: document.getElementById('supplierName').value,
        contact: document.getElementById('contactPerson').value,
        email: document.getElementById('supplierEmail').value,
        phone: document.getElementById('supplierPhone').value,
        address: document.getElementById('supplierAddress').value
    };

    try {
        await window.apiAddSupplier(supplierData);

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('addSupplierModal'));
        modal.hide();
        form.reset();
        form.classList.remove('was-validated');

        // Reload suppliers
        loadSuppliers();

        showToast('Supplier added successfully!', 'success');
    } catch(e) {
        showToast('Failed to add supplier: ' + e.message, 'error');
    }
}

async function editSupplier(supplierId) {
    const supplier = await getSupplierById(supplierId);
    if (!supplier) return;

    // Populate edit form
    document.getElementById('editSupplierId').value = supplier.id;
    document.getElementById('editSupplierName').value = supplier.name;
    document.getElementById('editContactPerson').value = supplier.contact;
    document.getElementById('editSupplierEmail').value = supplier.email;
    document.getElementById('editSupplierPhone').value = supplier.phone;
    document.getElementById('editSupplierAddress').value = supplier.address;

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editSupplierModal'));
    modal.show();
}

async function handleUpdateSupplier() {
    const form = document.getElementById('editSupplierForm');

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const supplierId = parseInt(document.getElementById('editSupplierId').value);
    const supplierData = {
        name: document.getElementById('editSupplierName').value,
        contact: document.getElementById('editContactPerson').value,
        email: document.getElementById('editSupplierEmail').value,
        phone: document.getElementById('editSupplierPhone').value,
        address: document.getElementById('editSupplierAddress').value
    };

    try {
        await window.apiUpdateSupplier(supplierId, supplierData);

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('editSupplierModal'));
        modal.hide();
        form.reset();
        form.classList.remove('was-validated');

        // Reload suppliers
        loadSuppliers();

        showToast('Supplier updated successfully!', 'success');
    } catch(e) {
        showToast('Failed to update supplier: ' + e.message, 'error');
    }
}

function confirmDelete(supplierId, supplierName) {
    document.getElementById('deleteSupplierName').textContent = supplierName;
    document.getElementById('confirmDeleteBtn').onclick = () => handleDeleteSupplier(supplierId);

    const modal = new bootstrap.Modal(document.getElementById('deleteSupplierModal'));
    modal.show();
}

async function handleDeleteSupplier(supplierId) {
    // Check if supplier is used by any products
    const products = await getProducts();
    const supplierInUse = products.some(product => product.supplierId === supplierId);

    if (supplierInUse) {
        showToast('Cannot delete supplier. It is associated with existing products.', 'error');
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteSupplierModal'));
        modal.hide();
        return;
    }

    try { 
        await window.apiDeleteSupplier(supplierId);
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteSupplierModal'));
        modal.hide();

        // Reload suppliers
        loadSuppliers();

        showToast('Supplier deleted successfully!', 'success');
    } catch(e) {
        showToast('Failed to delete supplier: ' + e.message, 'error');
    }
}

// Export functions for global use
window.editSupplier = editSupplier;
window.confirmDelete = confirmDelete;
window.changePage = changePage;
window.clearSearch = clearSearch;