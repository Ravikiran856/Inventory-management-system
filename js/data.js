// API integration for Smart Inventory Management System
function resolveApiBase() {
    const stored = localStorage.getItem('apiBase');
    if (stored) {
        const normalized = stored.trim().replace(/\/+$/, '').replace(/\/api$/i, '');
        if (normalized) return normalized;
    }

    const { protocol, hostname, port, origin } = window.location;
    if (protocol === 'file:') {
        return 'http://localhost:5000';
    }
    if (protocol.startsWith('http') && (hostname === 'localhost' || hostname === '127.0.0.1')) {
        return origin;
    }
    return 'http://localhost:5000';
}

const API_BASE = resolveApiBase();
const API_URL = `${API_BASE}/api`;
window.API_BASE = API_BASE;

function apiConnectionHint() {
    if (window.location.protocol === 'file:') {
        return 'Do not open HTML files directly. Start the server (npm start in backend), then open http://localhost:5000';
    }
    return `Start the server with "npm start" in the backend folder, then open http://localhost:5000 (API: ${API_URL})`;
}

async function apiFetch(url, options = {}) {
    let response;
    try {
        response = await fetch(url, options);
    } catch {
        throw new Error(apiConnectionHint());
    }
    return handleResponse(response);
}

async function checkApiHealth() {
    try {
        const response = await fetch(`${API_URL}/health`);
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};
        if (!response.ok || !data.success) {
            throw new Error(apiConnectionHint());
        }
        return true;
    } catch {
        throw new Error(apiConnectionHint());
    }
}

window.checkApiHealth = checkApiHealth;

// Helper to get auth headers
const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

// Error handler
const handleResponse = async (response) => {
    const text = await response.text();
    let data = {};

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            const isHtml = text.trimStart().startsWith('<');
            const hint = isHtml ? apiConnectionHint() : 'Invalid JSON from server';
            throw new Error(hint);
        }
    }

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('rememberedUser');
            const onLoginPage = window.location.pathname.endsWith('index.html') ||
                window.location.pathname === '/' ||
                window.location.pathname.endsWith('/');
            window.location.href = onLoginPage ? 'index.html' : '../index.html';
        }
        throw new Error(data.message || `Request failed (${response.status})`);
    }
    return data;
};

// Auth APIs
async function loginUser(username, password) {
    return apiFetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
}

async function registerUserAPI(userData) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    return handleResponse(response);
}

// Product APIs
async function getProducts() {
    const response = await fetch(`${API_URL}/products`, { headers: getHeaders() });
    const res = await handleResponse(response);
    return res.data.map(p => ({
        id: p.product_id,
        name: p.product_name,
        category: p.category,
        price: p.price,
        quantity: p.quantity,
        supplier: p.supplier_name,
        supplierId: p.supplier_id,
        image: p.image,
        status: p.status,
        description: p.description
    }));
}

async function getProductById(id) {
    const response = await fetch(`${API_URL}/products/${id}`, { headers: getHeaders() });
    const res = await handleResponse(response);
    const p = res.data;
    return {
        id: p.product_id,
        name: p.product_name,
        category: p.category,
        price: p.price,
        quantity: p.quantity,
        supplier: p.supplier_name,
        supplierId: p.supplier_id,
        image: p.image,
        status: p.status,
        description: p.description
    };
}

async function addProduct(product) {
    const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
            name: product.name,
            category: product.category,
            price: product.price,
            quantity: product.quantity,
            supplierId: product.supplierId,
            image: product.image,
            description: product.description
        })
    });
    return handleResponse(response);
}

async function updateProduct(id, product) {
    const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
            name: product.name,
            category: product.category,
            price: product.price,
            quantity: product.quantity,
            supplierId: product.supplierId,
            image: product.image,
            description: product.description
        })
    });
    return handleResponse(response);
}

async function deleteProduct(id) {
    const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    return handleResponse(response);
}

async function getCategories() {
    try {
        const response = await fetch(`${API_URL}/products/categories`, { headers: getHeaders() });
        const res = await handleResponse(response);
        return res.data;
    } catch {
        return ['Electronics', 'Accessories', 'Furniture', 'Supplies', 'Storage', 'Books', 'Clothing'];
    }
}

// Supplier APIs
async function getSuppliers() {
    const response = await fetch(`${API_URL}/suppliers`, { headers: getHeaders() });
    const res = await handleResponse(response);
    return res.data.map(s => ({
        id: s.supplier_id,
        name: s.supplier_name,
        contact: s.contact_name,
        email: s.email,
        phone: s.contact_number,
        address: s.address
    }));
}

async function getSupplierById(id) {
    const response = await fetch(`${API_URL}/suppliers/${id}`, { headers: getHeaders() });
    const res = await handleResponse(response);
    const s = res.data;
    return {
        id: s.supplier_id,
        name: s.supplier_name,
        contact: s.contact_name,
        email: s.email,
        phone: s.contact_number,
        address: s.address
    };
}

async function addSupplier(supplier) {
    const response = await fetch(`${API_URL}/suppliers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(supplier)
    });
    return handleResponse(response);
}

async function updateSupplier(id, supplier) {
    const response = await fetch(`${API_URL}/suppliers/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(supplier)
    });
    return handleResponse(response);
}

async function deleteSupplier(id) {
    const response = await fetch(`${API_URL}/suppliers/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    return handleResponse(response);
}

// Stock APIs
async function updateStockLevel(productId, quantity) {
    const response = await fetch(`${API_URL}/stocks/${productId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ quantity })
    });
    return handleResponse(response);
}

// Dashboard APIs
async function getStats() {
    const response = await fetch(`${API_URL}/dashboard/stats`, { headers: getHeaders() });
    const res = await handleResponse(response);
    return res.data;
}

async function getStockByCategory() {
    const response = await fetch(`${API_URL}/dashboard/stock-by-category`, { headers: getHeaders() });
    const res = await handleResponse(response);
    return res.data;
}

async function getLowStockProducts() {
    const response = await fetch(`${API_URL}/dashboard/low-stock`, { headers: getHeaders() });
    const res = await handleResponse(response);
    return res.data;
}

async function importImageFromUrl(url) {
    const response = await fetch(`${API_URL}/products/import-image-url`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ url })
    });
    return handleResponse(response);
}

async function saveImageData(imageData) {
    const response = await fetch(`${API_URL}/products/save-image-data`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ imageData })
    });
    return handleResponse(response);
}

async function getDashboardOverview() {
    const response = await fetch(`${API_URL}/dashboard/overview`, { headers: getHeaders() });
    const res = await handleResponse(response);
    return res.data;
}

// Export functions for global use
window.loginUser = loginUser;
window.registerUserAPI = registerUserAPI;
window.getProducts = getProducts;
window.getProductById = getProductById;
window.getSuppliers = getSuppliers;
window.getSupplierById = getSupplierById;
window.getCategories = getCategories;
window.getStats = getStats;
window.getStockByCategory = getStockByCategory;
window.getLowStockProducts = getLowStockProducts;
window.getDashboardOverview = getDashboardOverview;
window.apiAddProduct = addProduct;
window.apiUpdateProduct = updateProduct;
window.apiDeleteProduct = deleteProduct;
window.apiAddSupplier = addSupplier;
window.apiUpdateSupplier = updateSupplier;
window.apiDeleteSupplier = deleteSupplier;
window.apiUpdateStockLevel = updateStockLevel;
window.importImageFromUrl = importImageFromUrl;
window.saveImageData = saveImageData;
