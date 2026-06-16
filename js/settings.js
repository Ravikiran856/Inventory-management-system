// Settings page specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    loadPreferences();
    setupEventListeners();
});

function setupEventListeners() {
    // Profile form
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProfile();
    });

    // Password form
    document.getElementById('passwordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        changePassword();
    });

    // Password visibility toggles
    document.getElementById('toggleCurrentPassword').addEventListener('click', function() {
        togglePasswordVisibility('currentPassword');
    });

    document.getElementById('toggleNewPassword').addEventListener('click', function() {
        togglePasswordVisibility('newPassword');
    });

    document.getElementById('toggleConfirmPassword').addEventListener('click', function() {
        togglePasswordVisibility('confirmNewPassword');
    });

    // Real-time password validation
    document.getElementById('confirmNewPassword').addEventListener('input', function() {
        validatePasswordConfirmation();
    });

    document.getElementById('newPassword').addEventListener('input', function() {
        validatePasswordLength();
    });
}

function loadUserProfile() {
    if (currentUser) {
        // Split name into first and last name
        const nameParts = currentUser.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        document.getElementById('firstName').value = firstName;
        document.getElementById('lastName').value = lastName;
        document.getElementById('userEmail').value = currentUser.email || '';
        document.getElementById('userRole').value = currentUser.role || 'User';
        document.getElementById('userBio').value = localStorage.getItem('userBio') || '';
    }
}

function loadPreferences() {
    // Load dark mode preference
    const darkMode = localStorage.getItem('theme') === 'dark';
    document.getElementById('darkModePreference').checked = darkMode;

    // Load other preferences
    const language = localStorage.getItem('language') || 'en';
    document.getElementById('languageSelect').value = language;

    const timezone = localStorage.getItem('timezone') || 'UTC';
    document.getElementById('timezoneSelect').value = timezone;

    const itemsPerPage = localStorage.getItem('itemsPerPage') || '10';
    document.getElementById('itemsPerPage').value = itemsPerPage;

    // Load notification settings
    const lowStockAlerts = localStorage.getItem('lowStockAlerts') !== 'false';
    document.getElementById('lowStockAlerts').checked = lowStockAlerts;

    const inventoryReports = localStorage.getItem('inventoryReports') !== 'false';
    document.getElementById('inventoryReports').checked = inventoryReports;

    const systemUpdates = localStorage.getItem('systemUpdates') === 'true';
    document.getElementById('systemUpdates').checked = systemUpdates;

    const browserNotifications = localStorage.getItem('browserNotifications') === 'true';
    document.getElementById('browserNotifications').checked = browserNotifications;

    const enable2FA = localStorage.getItem('enable2FA') === 'true';
    document.getElementById('enable2FA').checked = enable2FA;
}

function saveProfile() {
    const form = document.getElementById('profileForm');

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('userEmail').value;
    const bio = document.getElementById('userBio').value;

    // Update current user
    currentUser.name = `${firstName} ${lastName}`;
    currentUser.email = email;

    // Save to localStorage
    localStorage.setItem('rememberedUser', JSON.stringify(currentUser));
    localStorage.setItem('userBio', bio);

    // Update UI
    updateUserInterface();

    showToast('Profile updated successfully!', 'success');
}

function changePassword() {
    const form = document.getElementById('passwordForm');

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;

    // Validate current password
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const user = registeredUsers.find(u => u.username === currentUser.username);

    if (!user || user.password !== currentPassword) {
        showToast('Current password is incorrect', 'error');
        document.getElementById('currentPassword').setCustomValidity('Incorrect password');
        form.classList.add('was-validated');
        return;
    }

    // Validate new password
    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        document.getElementById('confirmNewPassword').setCustomValidity('Passwords do not match');
        form.classList.add('was-validated');
        return;
    }

    if (newPassword.length < 6) {
        showToast('New password must be at least 6 characters', 'error');
        document.getElementById('newPassword').setCustomValidity('Password too short');
        form.classList.add('was-validated');
        return;
    }

    // Update password
    user.password = newPassword;
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

    // Reset form
    form.reset();
    form.classList.remove('was-validated');

    showToast('Password changed successfully!', 'success');
}

function savePreferences() {
    const language = document.getElementById('languageSelect').value;
    const timezone = document.getElementById('timezoneSelect').value;
    const itemsPerPage = document.getElementById('itemsPerPage').value;

    localStorage.setItem('language', language);
    localStorage.setItem('timezone', timezone);
    localStorage.setItem('itemsPerPage', itemsPerPage);

    showToast('Preferences saved successfully!', 'success');
}

function saveNotificationSettings() {
    const lowStockAlerts = document.getElementById('lowStockAlerts').checked;
    const inventoryReports = document.getElementById('inventoryReports').checked;
    const systemUpdates = document.getElementById('systemUpdates').checked;
    const browserNotifications = document.getElementById('browserNotifications').checked;
    const enable2FA = document.getElementById('enable2FA').checked;

    localStorage.setItem('lowStockAlerts', lowStockAlerts);
    localStorage.setItem('inventoryReports', inventoryReports);
    localStorage.setItem('systemUpdates', systemUpdates);
    localStorage.setItem('browserNotifications', browserNotifications);
    localStorage.setItem('enable2FA', enable2FA);

    showToast('Notification settings saved successfully!', 'success');
}

function togglePasswordVisibility(fieldId) {
    const field = document.getElementById(fieldId);
    const button = field.nextElementSibling;
    const icon = button.querySelector('i');

    if (field.type === 'password') {
        field.type = 'text';
        icon.className = 'bi bi-eye-slash';
    } else {
        field.type = 'password';
        icon.className = 'bi bi-eye';
    }
}

function validatePasswordConfirmation() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    const confirmField = document.getElementById('confirmNewPassword');

    if (confirmPassword && newPassword !== confirmPassword) {
        confirmField.setCustomValidity('Passwords do not match');
    } else {
        confirmField.setCustomValidity('');
    }
}

function validatePasswordLength() {
    const newPassword = document.getElementById('newPassword').value;
    const passwordField = document.getElementById('newPassword');

    if (newPassword && newPassword.length < 6) {
        passwordField.setCustomValidity('Password must be at least 6 characters');
    } else {
        passwordField.setCustomValidity('');
    }
}

// Export functions for global use
window.saveProfile = saveProfile;
window.savePreferences = savePreferences;
window.saveNotificationSettings = saveNotificationSettings;
window.togglePasswordVisibility = togglePasswordVisibility;