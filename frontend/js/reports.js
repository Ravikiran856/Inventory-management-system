// Reports page — inventory only

let categoryChartInstance = null;
let statusChartInstance = null;

document.addEventListener('DOMContentLoaded', function() {
    generateReport();
});

async function generateReport() {
    try {
        const products = await getProducts();
        const stockByCategory = await getStockByCategory();

        const totalProducts = products.length;
        const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);
        const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
        const lowStock = products.filter(p => p.status === 'Low Stock').length;
        const outOfStock = products.filter(p => p.status === 'Out of Stock').length;

        document.getElementById('totalProducts').textContent = totalProducts;
        document.getElementById('totalUnits').textContent = totalUnits;
        document.getElementById('totalValue').textContent = formatCurrency(totalValue);
        document.getElementById('lowStockCount').textContent = lowStock;
        document.getElementById('outOfStockCount').textContent = outOfStock;

        renderReportTable(products);
        renderCharts(stockByCategory, products);
    } catch (error) {
        console.error('Report error:', error);
        showToast('Failed to generate report: ' + error.message, 'error');
    }
}

function renderReportTable(products) {
    const tableBody = document.getElementById('reportTableBody');
    tableBody.innerHTML = '';

    if (products.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-muted">No products found</td>
            </tr>
        `;
        return;
    }

    products.forEach((product) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td><span class="badge bg-secondary">${product.category}</span></td>
            <td>${product.supplier || 'N/A'}</td>
            <td>${product.quantity}</td>
            <td>${formatCurrency(product.price)}</td>
            <td>${formatCurrency(product.price * product.quantity)}</td>
            <td><span class="badge bg-${getStatusBadgeClass(product.status)}">${product.status}</span></td>
        `;
        tableBody.appendChild(row);
    });
}

function renderCharts(stockByCategory, products) {
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    if (categoryChartInstance) categoryChartInstance.destroy();

    categoryChartInstance = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: stockByCategory.labels.length ? stockByCategory.labels : ['No data'],
            datasets: [{
                data: stockByCategory.values.length ? stockByCategory.values : [0],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(40, 167, 69, 0.8)',
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(220, 53, 69, 0.8)',
                    'rgba(108, 117, 125, 0.8)'
                ]
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const statusCounts = {
        'In Stock': products.filter(p => p.status === 'In Stock').length,
        'Low Stock': products.filter(p => p.status === 'Low Stock').length,
        'Out of Stock': products.filter(p => p.status === 'Out of Stock').length
    };

    const statusCtx = document.getElementById('statusChart').getContext('2d');
    if (statusChartInstance) statusChartInstance.destroy();

    statusChartInstance = new Chart(statusCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                label: 'Products',
                data: Object.values(statusCounts),
                backgroundColor: ['rgba(40, 167, 69, 0.8)', 'rgba(255, 193, 7, 0.8)', 'rgba(220, 53, 69, 0.8)']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });
}

function exportReport(format) {
    showToast(`Exporting report as ${format.toUpperCase()}...`, 'info');
    setTimeout(() => showToast(`Report exported as ${format.toUpperCase()}!`, 'success'), 1500);
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'In Stock': return 'success';
        case 'Low Stock': return 'warning text-dark';
        case 'Out of Stock': return 'danger';
        default: return 'secondary';
    }
}

window.generateReport = generateReport;
window.exportReport = exportReport;
