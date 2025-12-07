// DOM Elements
const signupForm = document.getElementById('signupForm');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');
const passwordToggles = document.querySelectorAll('.toggle-password');

// Current user
let currentUser = null;

// Theme 
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Password
function initPasswordToggles() {
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            
            passwordInput.type = type;
            this.className = type === 'password' ? 'fas fa-eye toggle-password' : 'fas fa-eye-slash toggle-password';
        });
    });
}

//  Validation
function validateForm(formData) {
    const errors = [];

    // Name validation
    if (!formData.firstName.trim()) {
        errors.push('First name is required');
    }
    if (!formData.lastName.trim()) {
        errors.push('Last name is required');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        errors.push('Please enter a valid email address');
    }

    // Password validation
    if (formData.password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }
    if (formData.password !== formData.confirmPassword) {
        errors.push('Passwords do not match');
    }

    // Check if email already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some(user => user.email === formData.email)) {
        errors.push('An account with this email already exists');
    }

    return errors;
}

// Submission
function handleSignupSubmit(e) {
    e.preventDefault();

    const formData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };

    // Clear previous errors
    clearErrors();

    // Validate form
    const errors = validateForm(formData);
    
    if (errors.length > 0) {
        showErrors(errors);
        return;
    }

    // Save user to localStorage
    saveUser(formData);

    // Show success message and redirect
    showSuccessMessage(formData.firstName);
}

// Clear error messages
function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelectorAll('.input-group').forEach(group => {
        group.classList.remove('error');
    });
}

// Show error messages
function showErrors(errors) {
    errors.forEach(error => {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = error;
        errorDiv.style.color = '#ff4757';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        
        // Find appropriate position to insert error
        const formGroups = document.querySelectorAll('.form-group');
        const lastGroup = formGroups[formGroups.length - 1];
        lastGroup.parentNode.insertBefore(errorDiv, lastGroup.nextSibling);
    });

    // Add error styling to inputs
    document.querySelectorAll('input').forEach(input => {
        if (!input.value.trim()) {
            input.parentElement.classList.add('error');
        }
    });
}

// Save user to localStorage
function saveUser(userData) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Create user object without confirmPassword
    const newUser = {
        id: Date.now().toString(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password, // Note: In production, hash this password!
        createdAt: new Date().toISOString(),
        isLoggedIn: true
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Set as current user
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    currentUser = newUser;
    
    // Update navigation
    updateNavigation();
}

// Show success message
function showSuccessMessage(firstName) {
    const formHeader = document.querySelector('.form-header');
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <i class="fas fa-check-circle" style="color: #2ecc71; font-size: 3rem; margin-bottom: 1rem;"></i>
        <h2 style="color: #2ecc71; margin-bottom: 1rem;">Welcome, ${firstName}!</h2>
        <p style="color: #666; margin-bottom: 1.5rem;">Your account has been created successfully.</p>
        <p style="color: #666;">Redirecting to homepage...</p>
    `;
    successMessage.style.textAlign = 'center';
    successMessage.style.padding = '2rem';

    // Replace form content
    const form = document.querySelector('.signup-form');
    form.innerHTML = '';
    form.appendChild(successMessage);

    // Redirect after 3 seconds
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 3000);
}

// Update navigation based on login state
function updateNavigation() {
    const userInfo = document.querySelector('.nav-user-info');
    const loggedInActions = document.querySelector('.logged-in-action');
    const signupLink = document.querySelector('.signup-link-wrapper');
    const loginLink = document.querySelector('.nav-pg.actions a[href="Login.html"]').parentElement;

    if (currentUser) {
        // User is logged in
        userInfo.style.display = 'block';
        userInfo.innerHTML = `
            <span class="user-greeting">Hello, ${currentUser.firstName}!</span>
        `;
        
        loggedInActions.style.display = 'block';
        loggedInActions.innerHTML = `
            <a href="#" class="nav-link" id="logoutBtn">
                <i class="fas fa-sign-out-alt"></i> Logout
            </a>
        `;

        // Hide signup and login links
        signupLink.style.display = 'none';
        loginLink.style.display = 'none';

        // Add logout event listener
        document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    } else {
        // User is not logged in
        userInfo.style.display = 'none';
        loggedInActions.style.display = 'none';
        signupLink.style.display = 'block';
        loginLink.style.display = 'block';
    }
}

// Handle logout
function handleLogout(e) {
    e.preventDefault();
    
    if (currentUser) {
        // Update user login status
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = users.map(user => {
            if (user.id === currentUser.id) {
                return { ...user, isLoggedIn: false };
            }
            return user;
        });
        
        localStorage.setItem('users', JSON.stringify(updatedUsers));
    }
    
    // Clear current user
    localStorage.removeItem('currentUser');
    currentUser = null;
    
    // Update navigation and redirect to home
    updateNavigation();
    window.location.href = 'index.html';
}

// Check current user on page load
function checkCurrentUser() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
        } catch (e) {
            console.error('Error parsing saved user:', e);
            localStorage.removeItem('currentUser');
        }
    }
    updateNavigation();
}

// Initialize everything
function init() {
    // Initialize theme
    initTheme();
    
    // Initialize password toggles
    initPasswordToggles();
    
    // Check current user
    checkCurrentUser();
    
    // Event listeners
    themeToggle.addEventListener('click', toggleTheme);
    signupForm.addEventListener('submit', handleSignupSubmit);
    
    // Add input validation on blur
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('blur', function() {
            validateInput(this);
        });
    });
}

// Validate individual input
function validateInput(input) {
    const value = input.value.trim();
    const inputGroup = input.parentElement;
    
    if (input.hasAttribute('required') && !value) {
        inputGroup.classList.add('error');
        return false;
    }
    
    if (input.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            inputGroup.classList.add('error');
            return false;
        }
    }
    
    inputGroup.classList.remove('error');
    return true;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);