// Login page specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Login form validation and submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!loginForm.checkValidity()) {
            e.stopPropagation();
            loginForm.classList.add('was-validated');
            return;
        }

        const username = document.getElementById('username').value;
        const password = passwordInput.value;
        const remember = document.getElementById('rememberMe').checked;

        // Show loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const loadingState = showLoading(submitBtn);

        try {
            const res = await window.loginUser(username, password);
            loadingState.hide();
            localStorage.setItem("token", res.token);
            localStorage.setItem("rememberedUser", JSON.stringify(res.user));
            showToast("Login successful!", "success");
            setTimeout(() => { window.location.href = "pages/dashboard.html"; }, 1000);
        } catch(e) {
            loadingState.hide();
            showToast(e.message, "error");
            loginForm.classList.add('was-validated');
        }
    });

    // Registration form validation and submission
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!registerForm.checkValidity()) {
            e.stopPropagation();
            registerForm.classList.add('was-validated');
            return;
        }

        // Additional password validation
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        if (password !== confirmPassword) {
            document.getElementById('registerConfirmPassword').setCustomValidity('Passwords do not match');
            registerForm.classList.add('was-validated');
            return;
        }

        if (password.length < 6) {
            document.getElementById('registerPassword').setCustomValidity('Password must be at least 6 characters');
            registerForm.classList.add('was-validated');
            return;
        }

        // Show loading state
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const loadingState = showLoading(submitBtn);

        const userData = {
            firstName: document.getElementById('registerFirstName').value,
            lastName: document.getElementById('registerLastName').value,
            username: document.getElementById('registerUsername').value,
            email: document.getElementById('registerEmail').value,
            password: password
        };

        try {
            await window.registerUserAPI(userData);
            loadingState.hide();
            const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
            modal.hide();
            registerForm.reset();
            registerForm.classList.remove('was-validated');
            showToast('Account created successfully! You can now login.', 'success');
        } catch(e) {
            loadingState.hide();
            showToast(e.message, 'error');
            registerForm.classList.add('was-validated');
        }
    });

    // Password visibility toggles
    togglePasswordBtn.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        const icon = this.querySelector('i');
        icon.className = type === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash';
    });

    document.getElementById('toggleRegisterPassword').addEventListener('click', function() {
        const passwordField = document.getElementById('registerPassword');
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);

        const icon = this.querySelector('i');
        icon.className = type === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash';
    });

    document.getElementById('toggleRegisterConfirmPassword').addEventListener('click', function() {
        const confirmPasswordField = document.getElementById('registerConfirmPassword');
        const type = confirmPasswordField.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPasswordField.setAttribute('type', type);

        const icon = this.querySelector('i');
        icon.className = type === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash';
    });

    // Real-time password confirmation validation
    document.getElementById('registerConfirmPassword').addEventListener('input', function() {
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = this.value;

        if (confirmPassword && password !== confirmPassword) {
            this.setCustomValidity('Passwords do not match');
        } else {
            this.setCustomValidity('');
        }
    });

    // Real-time password length validation
    document.getElementById('registerPassword').addEventListener('input', function() {
        const password = this.value;

        if (password && password.length < 6) {
            this.setCustomValidity('Password must be at least 6 characters');
        } else {
            this.setCustomValidity('');
        }
    });

    // Auto-focus username field
    document.getElementById('username').focus();

    // Enter key navigation
    document.getElementById('username').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('password').focus();
        }
    });

    // Check for remembered user
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        const user = JSON.parse(rememberedUser);
        document.getElementById('username').value = user.username;
        document.getElementById('rememberMe').checked = true;
        document.getElementById('password').focus();
    }

    // Add fade-in animation
    document.querySelector('.card').classList.add('fade-in');
});
