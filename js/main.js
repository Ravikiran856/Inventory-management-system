// Main JavaScript file for Smart Inventory Management System

// Global variables
let currentUser = null;
let isDarkMode = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    if (window.location.protocol === 'file:') {
        const target = 'http://localhost:5000/';
        if (typeof showToast === 'function') {
            showToast('Redirecting to the app server…', 'primary');
        }
        window.location.replace(target);
        return;
    }

    if (typeof checkApiHealth === 'function') {
        checkApiHealth().catch((err) => {
            if (typeof showToast === 'function') {
                showToast(err.message, 'error');
            }
            console.error(err.message);
        });
    }

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        toggleDarkMode();
    }

    // Check for remembered login and token
    const token = localStorage.getItem('token');
    const rememberedUser = localStorage.getItem('rememberedUser');
    
    // Protect pages route
    if (window.location.pathname.includes('/pages/')) {
        if (!token || !rememberedUser) {
            window.location.href = '../index.html';
            return;
        }
        currentUser = JSON.parse(rememberedUser);
        updateUserInterface();
    } else if (token && rememberedUser && (
        window.location.pathname.endsWith('index.html') ||
        window.location.pathname === '/' ||
        window.location.pathname.endsWith('/')
    )) {
        window.location.href = 'pages/dashboard.html';
    }

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
}

function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    localStorage.removeItem('rememberedUser');
    window.location.href = '../index.html';
}

// UI functions
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');

    // Save preference
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

    // Update toggle button
    const toggleBtn = document.getElementById('darkModeToggle');
    if (toggleBtn) {
        toggleBtn.innerHTML = isDarkMode ?
            '<i class="bi bi-sun"></i>' :
            '<i class="bi bi-moon"></i>';
    }
}

function updateUserInterface() {
    if (currentUser) {
        const displayName = [currentUser.firstName, currentUser.lastName].filter(Boolean).join(' ').trim()
            || currentUser.username
            || 'User';

        document.querySelectorAll('.user-name').forEach(el => { el.textContent = displayName; });
        document.querySelectorAll('.user-role').forEach(el => { el.textContent = currentUser.role || 'User'; });
    }
}

function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'primary'} border-0`;
    toastEl.setAttribute('role', 'alert');
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    toastContainer.appendChild(toastEl);

    // Initialize and show toast
    const toast = new bootstrap.Toast(toastEl);
    toast.show();

    // Remove toast after it's hidden
    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}

function showLoading(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="loading me-2"></span>Loading...';
    button.disabled = true;

    return {
        hide: () => {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    };
}

const PRODUCT_IMAGE_PLACEHOLDER = 'https://placehold.co/80x80/e9ecef/6c757d?text=No+Image';

function getApiBaseForAssets() {
    if (typeof window.API_BASE === 'string') {
        return window.API_BASE.replace(/\/$/, '');
    }
    const stored = localStorage.getItem('apiBase');
    if (stored) return stored.replace(/\/$/, '');
    if (window.location.protocol.startsWith('http') && window.location.port === '5000') {
        return window.location.origin;
    }
    return 'http://localhost:5000';
}

function getProductImageUrl(url) {
    const trimmed = (url || '').trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
        return PRODUCT_IMAGE_PLACEHOLDER;
    }
    if (trimmed.startsWith('/uploads/')) {
        return getApiBaseForAssets() + trimmed;
    }
    if (trimmed.startsWith('data:image/')) {
        return trimmed;
    }
    return trimmed;
}

function getProductImageForSave(url) {
    const trimmed = (url || '').trim();
    if (!trimmed) {
        return PRODUCT_IMAGE_PLACEHOLDER;
    }
    return trimmed;
}

function previewProductImage(inputId, imgId) {
    const input = document.getElementById(inputId);
    const img = document.getElementById(imgId);
    if (!input || !img) return;

    const url = getProductImageUrl(input.value);
    if (!input.value.trim()) {
        img.style.display = 'none';
        return;
    }
    img.src = url;
    img.style.display = 'block';
    img.onerror = function() {
        this.onerror = null;
        this.src = PRODUCT_IMAGE_PLACEHOLDER;
    };
}

async function handleProductImageFile(fileInputId, textInputId, previewId) {
    const fileInput = document.getElementById(fileInputId);
    const textInput = document.getElementById(textInputId);
    if (!fileInput?.files?.[0] || !textInput) return;

    const file = fileInput.files[0];
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image is too large (max 5MB)', 'error');
        fileInput.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
        try {
            const res = await window.saveImageData(reader.result);
            textInput.value = res.data.imageUrl;
            previewProductImage(textInputId, previewId);
            showToast('Image uploaded', 'success');
        } catch (error) {
            showToast('Upload failed: ' + error.message, 'error');
        }
    };
    reader.readAsDataURL(file);
}

async function handleImportImageUrl(inputId, previewId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const url = input.value.trim();
    if (!url) {
        showToast('Paste an image URL first', 'error');
        return;
    }

    if (url.startsWith('/uploads/')) {
        previewProductImage(inputId, previewId);
        return;
    }

    try {
        const res = await window.importImageFromUrl(url);
        input.value = res.data.imageUrl;
        previewProductImage(inputId, previewId);
        showToast('Image imported', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(new Date(date));
}

function confirmAction(message) {
    return confirm(message);
}

// Sidebar toggle for mobile
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('show');
        mainContent.classList.toggle('shifted');
    } else {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    }
}

// Export functions for global use
window.logout = logout;
window.toggleDarkMode = toggleDarkMode;
window.showToast = showToast;
window.showLoading = showLoading;
window.getProductImageUrl = getProductImageUrl;
window.getProductImageForSave = getProductImageForSave;
window.previewProductImage = previewProductImage;
window.handleProductImageFile = handleProductImageFile;
window.handleImportImageUrl = handleImportImageUrl;
window.PRODUCT_IMAGE_PLACEHOLDER = PRODUCT_IMAGE_PLACEHOLDER;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.confirmAction = confirmAction;
window.toggleSidebar = toggleSidebar;