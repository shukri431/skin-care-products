// DOM Elements
const loginForm = document.getElementById('loginForm');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');
const menuToggle = document.querySelector('.menu-toggle');
const navPgs = document.querySelector('.nav-pgs');

// Current user tracking
let currentUser = null;

// Theme Management
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

// Mobile Menu Toggle
function initMobileMenu() {
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navPgs.classList.toggle('active');
        });
        
        // xidhid menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !navPgs.contains(e.target)) {
                navPgs.classList.remove('active');
            }
        });
    }
}

// Form Validation
function validateLoginForm(email, password) {
    const errors = [];

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errors.push('Please enter a valid email address');
    }

    // Password validation
    if (password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }

    return errors;
}

// Authentication
function authenticateUser(email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find user by email
    const user = users.find(u => u.email === email);
    
    if (!user) {
        return { success: false, message: 'No account found with this email' };
    }
    
    // Check password (Note: In production, compare hashed passwords)
    if (user.password !== password) {
        return { success: false, message: 'Incorrect password' };
    }
    
    return { success: true, user };
}

// Handle Form Submission
function handleLoginSubmit(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Clear previous errors
    clearErrors();

    // Validate form
    const errors = validateLoginForm(email, password);
    
    if (errors.length > 0) {
        showErrors(errors);
        return;
    }

    // Authenticate user
    const authResult = authenticateUser(email, password);
    
    if (!authResult.success) {
        showErrors([authResult.message]);
        return;
    }

    // Login successful
    loginSuccess(authResult.user);
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
    // Remove any existing success messages
    const successMessages = document.querySelectorAll('.success-message');
    successMessages.forEach(msg => msg.remove());

    errors.forEach(error => {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = error;
        errorDiv.style.color = '#ff4757';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        errorDiv.style.padding = '0.5rem';
        errorDiv.style.backgroundColor = 'rgba(255, 71, 87, 0.1)';
        errorDiv.style.borderRadius = '4px';
        
        // Insert error message before the form
        const form = document.querySelector('.auth-form');
        form.insertBefore(errorDiv, form.firstChild);
    });

    // Add error styling to inputs
    document.querySelectorAll('input').forEach(input => {
        if (!input.value.trim()) {
            input.parentElement.classList.add('error');
        }
    });
}

// Handle successful login
function loginSuccess(user) {
    // Update user login status
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(u => {
        if (u.id === user.id) {
            return { ...u, isLoggedIn: true, lastLogin: new Date().toISOString() };
        }
        return u;
    });
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Set as current user
    const userToStore = { ...user, isLoggedIn: true };
    localStorage.setItem('currentUser', JSON.stringify(userToStore));
    currentUser = userToStore;
    
    // Show success message
    showSuccessMessage(user.firstName);
}

// Show success message and redirect
function showSuccessMessage(firstName) {
    // Clear form
    clearErrors();
    
    const formHeader = document.querySelector('.auth-header');
    const form = document.querySelector('.auth-form');
    
    // Create success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <i class="fas fa-check-circle" style="color: #2ecc71; font-size: 3rem; margin-bottom: 1rem;"></i>
            <h2 style="color: #2ecc71; margin-bottom: 1rem;">Welcome back, ${firstName}!</h2>
            <p style="color: #666; margin-bottom: 1.5rem;">Login successful. Redirecting to homepage...</p>
            <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #2ecc71; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        </div>
    `;
    
    // Style for spinner animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    // Replace form with success message
    form.innerHTML = '';
    form.appendChild(successMessage);
    
    // Update navigation immediately
    updateNavigation();
    
    // Redirect after 3 seconds
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 3000);
}

// Update navigation
function updateNavigation() {
    const userInfo = document.querySelector('.nav-user-info');
    const loggedInActions = document.querySelector('.logged-in-action');
    const signupLink = document.querySelector('.signup-link-wrapper');
    const loginLink = document.querySelector('.nav-pg.actions a[href="Login.html"]')?.parentElement;

    if (currentUser) {
        // User is logged in
        if (userInfo) {
            userInfo.style.display = 'block';
            userInfo.innerHTML = `
                <span class="user-greeting" style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-user-circle" style="font-size: 1.2rem;"></i>
                    <span>Hello, ${currentUser.firstName}!</span>
                </span>
            `;
        }
        
        if (loggedInActions) {
            loggedInActions.style.display = 'block';
            loggedInActions.innerHTML = `
                <a href="#" class="nav-link" id="logoutBtn" style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            `;
        }

        // Hide signup and login links
        if (signupLink) signupLink.style.display = 'none';
        if (loginLink) loginLink.style.display = 'none';

        // Add logout event listener
        setTimeout(() => {
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', handleLogout);
            }
        }, 100);
    } else {
        // User is not logged in
        if (userInfo) userInfo.style.display = 'none';
        if (loggedInActions) loggedInActions.style.display = 'none';
        if (signupLink) signupLink.style.display = 'block';
        if (loginLink) loginLink.style.display = 'block';
    }
}

// Handle logout
function handleLogout(e) {
    e.preventDefault();
    
    if (currentUser) {
        // Update user login status in localStorage
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
    
    // Show logout message
    Swal.fire({
        icon: 'success',
        title: 'Logged out!',
        text: 'You have been successfully logged out.',
        timer: 2000,
        showConfirmButton: false
    }).then(() => {
        // Update navigation and redirect to home
        updateNavigation();
        window.location.href = 'index.html';
    });
}

// Check current user on page load
function checkCurrentUser() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            // If user is already logged in, redirect to home
            if (currentUser.isLoggedIn) {
                Swal.fire({
                    title: 'Already Logged In',
                    text: `You are already logged in as ${currentUser.firstName}. Redirecting to homepage...`,
                    icon: 'info',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = 'index.html';
                });
            }
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
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Check current user
    checkCurrentUser();
    
    // Event listeners
    themeToggle.addEventListener('click', toggleTheme);
    loginForm.addEventListener('submit', handleLoginSubmit);
    
    // Add input validation on blur
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('blur', function() {
            validateInput(this);
        });
    });
    
    // Add enter key support for form submission
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (this.id === 'password') {
                    loginForm.dispatchEvent(new Event('submit'));
                }
            }
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

// Remember me functionality (optional)
function initRememberMe() {
    const rememberMe = localStorage.getItem('rememberMe');
    if (rememberMe === 'true') {
        const savedEmail = localStorage.getItem('savedEmail');
        if (savedEmail) {
            document.getElementById('email').value = savedEmail;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);