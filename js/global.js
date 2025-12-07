// Global State Management
let currentUser = null;
let cart = [];

// Initialize application state
function initAppState() {
    // Load current user from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
        } catch (e) {
            console.error('Error parsing current user:', e);
            localStorage.removeItem('currentUser');
            currentUser = null;
        }
    }
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            console.error('Error parsing cart:', e);
            localStorage.removeItem('cart');
            cart = [];
        }
    }
    
    // Initialize theme
    initTheme();
}

// Check login status
function islogin() {
    return {
        login: currentUser !== null,
        user: currentUser
    };
}

// Login function
function loginUser(userData) {
    // Get all users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => 
        u.email === userData.email && u.password === userData.password
    );
    
    if (user) {
        // Update user login status
        const updatedUsers = users.map(u => {
            if (u.id === user.id) {
                return { ...u, isLoggedIn: true, lastLogin: new Date().toISOString() };
            }
            return u;
        });
        
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        // Set current user
        const userToStore = { ...user, isLoggedIn: true };
        localStorage.setItem('currentUser', JSON.stringify(userToStore));
        currentUser = userToStore;
        
        return { success: true, user: userToStore };
    }
    
    return { success: false, message: 'Invalid email or password' };
}

// Logout function
function logoutUser() {
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
    
    // Redirect to home page
    window.location.href = 'index.html';
}

// Register new user
function registerUser(userData) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if email already exists
    if (users.some(user => user.email === userData.email)) {
        return { success: false, message: 'Email already registered' };
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        createdAt: new Date().toISOString(),
        isLoggedIn: true
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Set as current user
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    currentUser = newUser;
    
    return { success: true, user: newUser };
}

// Navigation Actions
function navaAction(authActionLinks, userInfoElement, logoutElement) {
    if (!authActionLinks || !userInfoElement || !logoutElement) return;
    
    // Hide all auth action links initially
    authActionLinks.forEach(link => {
        if (link) link.style.display = 'none';
    });
    
    if (currentUser) {
        // User is logged in
        userInfoElement.style.display = 'block';
        userInfoElement.innerHTML = `
            <span class="user-greeting">
                <i class="fas fa-user-circle"></i>
                <span>Hello, ${currentUser.firstName}!</span>
            </span>
        `;
        
        logoutElement.style.display = 'block';
        logoutElement.innerHTML = `
            <a href="#" class="nav-link" id="logoutBtn">
                <i class="fas fa-sign-out-alt"></i> Logout
            </a>
        `;
        
        // Add logout event listener
        setTimeout(() => {
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    logoutUser();
                });
            }
        }, 100);
    } else {
        // User is not logged in
        userInfoElement.style.display = 'none';
        logoutElement.style.display = 'none';
        
        // Show auth links
        authActionLinks.forEach(link => {
            if (link) link.style.display = 'block';
        });
    }
}

// Set active navigation link
function Activenav(navLinks) {
    if (!navLinks || !navLinks.length) return;
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Cart Management
function getCart() {
    return cart;
}

function addToCart(product, quantity = 1) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image || './images/skincare-placeholder.jpg',
            quantity: quantity
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    return cart;
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    return cart;
}

function updateCartQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }
    return cart;
}

function clearCart() {
    cart = [];
    localStorage.removeItem('cart');
    updateCartCount();
}

function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getCartItemCount() {
    return cart.reduce((count, item) => count + item.quantity, 0);
}

// Update cart count in navigation
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const totalItems = getCartItemCount();
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
        element.style.display = totalItems > 0 ? 'flex' : 'none';
    });
}

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
    const themeIcons = document.querySelectorAll('.theme-toggle i');
    themeIcons.forEach(icon => {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });
}

// Notification System
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    notification.innerHTML = `
        <i class="${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Form Validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function validateForm(formData, rules) {
    const errors = {};
    
    for (const field in rules) {
        const rule = rules[field];
        const value = formData[field]?.trim();
        
        if (rule.required && !value) {
            errors[field] = rule.requiredMessage || `${field} is required`;
            continue;
        }
        
        if (value) {
            if (rule.type === 'email' && !validateEmail(value)) {
                errors[field] = 'Please enter a valid email address';
            } else if (rule.type === 'password' && !validatePassword(value)) {
                errors[field] = 'Password must be at least 6 characters';
            } else if (rule.minLength && value.length < rule.minLength) {
                errors[field] = rule.minLengthMessage || `Minimum ${rule.minLength} characters required`;
            } else if (rule.maxLength && value.length > rule.maxLength) {
                errors[field] = rule.maxLengthMessage || `Maximum ${rule.maxLength} characters allowed`;
            } else if (rule.match && value !== formData[rule.match]) {
                errors[field] = rule.matchMessage || 'Fields do not match';
            }
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
}

// Image Handling
function handleImageError(imgElement, fallbackImage = './images/skincare-placeholder.jpg') {
    imgElement.onerror = null; // Prevent infinite loop
    imgElement.src = fallbackImage;
}

function convertImgBBUrl(imgbbUrl) {
    if (imgbbUrl.includes('i.ibb.co')) {
        return imgbbUrl; // Already a direct URL
    }
    
    // Convert page URL to direct URL
    const urlParts = imgbbUrl.split('/');
    const imgId = urlParts[urlParts.length - 1];
    return `https://i.ibb.co/${imgId}/skincare.jpg`;
}

// Mobile Menu Toggle
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navPgs = document.querySelector('.nav-pgs');
    
    if (!menuToggle || !navPgs) return;
    
    menuToggle.addEventListener('click', () => {
        navPgs.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !navPgs.contains(e.target)) {
            navPgs.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    });
    
    // Close menu when clicking a link
    navPgs.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navPgs.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });
}

// Product Utility Functions
function generateStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars + 1 && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

function formatPrice(price) {
    return `$${parseFloat(price).toFixed(2)}`;
}

// Local Storage Management
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Error saving to localStorage:', e);
        return false;
    }
}

function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Error loading from localStorage:', e);
        return null;
    }
}

// Debounce function for search and filters
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initAppState();
    initMobileMenu();
    
    // Initialize theme toggle buttons
    const themeToggles = document.querySelectorAll('.theme-toggle');
    themeToggles.forEach(toggle => {
        toggle.addEventListener('click', toggleTheme);
    });
    
    // Update cart count on page load
    updateCartCount();
});

// Export functions for use in other modules
export {
    // User Management
    islogin,
    loginUser,
    logoutUser,
    registerUser,
    currentUser,
    
    // Navigation
    navaAction,
    Activenav,
    
    // Cart Management
    getCart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    updateCartCount,
    
    // Theme
    initTheme,
    toggleTheme,
    
    // Notifications
    showNotification,
    
    // Form Validation
    validateForm,
    validateEmail,
    validatePassword,
    
    // Image Handling
    handleImageError,
    convertImgBBUrl,
    
    // Product Utilities
    generateStarRating,
    formatPrice,
    
    // Local Storage
    saveToLocalStorage,
    loadFromLocalStorage,
    
    // Utility
    debounce
};