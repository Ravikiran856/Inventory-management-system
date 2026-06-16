// Dashboard page specific JavaScript

let stockChartInstance = null;

document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
});

async function loadDashboardData() {
    try {
        const overview = await getDashboardOverview();
        const stats = overview.stats;
        const stockByCategory = overview.stockByCategory;
        const lowStock = overview.lowStock;

        document.getElementById('totalProducts').textContent = stats.totalProducts || 0;
        document.getElementById('totalSuppliers').textContent = stats.totalSuppliers || 0;
        document.getElementById('lowStockProducts').textContent = stats.lowStockProducts || 0;
        document.getElementById('outOfStockProducts').textContent = stats.outOfStockProducts || 0;
        document.getElementById('totalInventoryValue').textContent = formatCurrency(stats.totalInventoryValue || 0);

        const lowStockTable = document.getElementById('lowStockTable');
        lowStockTable.innerHTML = '';

        if (!lowStock || lowStock.length === 0) {
            lowStockTable.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-3">All products are well stocked</td>
                </tr>
            `;
        } else {
            lowStock.forEach((product) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="text-truncate" style="max-width: 150px;" title="${product.product_name}">${product.product_name}</td>
                    <td>${product.category}</td>
                    <td>${product.quantity}</td>
                    <td><span class="badge bg-${product.status === 'Out of Stock' ? 'danger' : 'warning text-dark'}">${product.status}</span></td>
                `;
                lowStockTable.appendChild(row);
            });
        }

        renderStockChart(stockByCategory);

        document.querySelectorAll('.stat-card').forEach((card, index) => {
            setTimeout(() => card.classList.add('fade-in'), index * 100);
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        if (typeof showToast === 'function') {
            showToast('Failed to load dashboard data: ' + error.message, 'error');
        }
    }
}

function renderStockChart(stockByCategory) {
    const canvas = document.getElementById('stockChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (stockChartInstance) stockChartInstance.destroy();

    const labels = stockByCategory.labels.length ? stockByCategory.labels : ['No data'];
    const values = stockByCategory.values.length ? stockByCategory.values : [0];

    stockChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Units in stock',
                data: values,
                backgroundColor: 'rgba(102, 126, 234, 0.7)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

window.refreshDashboard = function() {
    loadDashboardData();
    showToast('Dashboard refreshed!', 'success');
};
