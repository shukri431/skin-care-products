import { 
    islogin, 
    navaAction, 
    Activenav, 
    addToCart, 
    updateCartCount,
    showNotification
} from "./global.js";

const api = "https://api.npoint.io/1b9987fb975da4edac2f";
const productsContainer = document.getElementById("products-container"); 
const FALLBACK_IMAGE_PATH = "./images/skincare-placeholder.jpg";

// 1. Fetch Products
let getProducts = async () => {
    try {
        // Only show notification haduu function-ka uu jiro
        if(typeof showNotification === 'function') showNotification("Loading products...", "info");
        
        const response = await fetch(api);
        const data = await response.json();
        
        // handle hadii ay api-gu uu  so celiyo array 
        const productsArray = Array.isArray(data) ? data : (data.products || []);
        
        console.log("Fetched products:", productsArray);
        
        // Store globally 
        window.allProducts = productsArray;
        
        displayProducts(productsArray);
        populateCategoryFilter(productsArray);
        
    } catch(error) {
        console.error("Error fetching products:", error);
        if(productsContainer) {
            productsContainer.innerHTML = `<h3>Unable to load products. Check console.</h3>`;
        }
    }
};

// 2. Display Products
function displayProducts(products) {
    if (!productsContainer) return;
    productsContainer.innerHTML = "";
    
    if (products.length === 0) {
        productsContainer.innerHTML = `<h3>No products found</h3>`;
        return;
    }
    
    products.forEach((product) => {
        const card = document.createElement("div");
        card.classList.add("card"); 
      card.innerHTML = `
    <a href="product.html?id=${product.id}" style="text-decoration: none; color: inherit;">
        <img src="${product.image || FALLBACK_IMAGE_PATH}" alt="${product.name}">
    </a>

    <div class="card-content">
        <!-- 2. Link around the Title -->
        <a href="product.html?id=${product.id}" style="text-decoration: none; color: inherit;">
            <h2>${product.name}</h2>
        </a>

        <p>${product.description || "Premium skincare product"}</p>
        <div class="rating-display">Rating: ${product.rating || 0}/5</div>
        <span>$${product.price ? product.price.toFixed(2) : "0.00"}</span>
        
        <!-- 3. Button is OUTSIDE the link -->
        <button onclick="addProductToCart(${product.id})" class="add-btn" style="margin-top:10px; cursor:pointer;">
            Add to Cart
        </button>
    </div>
`;
        productsContainer.appendChild(card);
    });
}

// 3. Add to Cart xaga html onclick ka shaqaysiinayo
window.addProductToCart = async function(productId) {
    // Check if Swal is loaded
    if (typeof Swal === 'undefined') {
        alert("SweetAlert library missing!");
        return;
    }

    const loginStatus = islogin(); // waxay ka qabata xaga hubinta objects hadiii uu soo celinayo { login: true/false }
    
    if (!loginStatus || !loginStatus.login) {
        Swal.fire({
            title: "Login Required",
            text: "Please login to shop",
            icon: "warning",
            confirmButtonText: "Go to Login"
        }).then((result) => {
            if (result.isConfirmed) window.location.href = "Login.html";
        });
        return;
    }
    
    const product = window.allProducts?.find(p => p.id === productId);
    
    if (product) {
        const { value: quantity } = await Swal.fire({
            title: `Add ${product.name}`,
            input: 'number',
            inputLabel: 'Quantity',
            inputValue: 1,
            inputAttributes: { min: 1, max: 10 },
            showCancelButton: true
        });
        
        if (quantity) {
            const cartItem = { ...product, quantity: parseInt(quantity) };
            addToCart(cartItem);
            updateCartCount();
            Swal.fire('Added!', `${quantity} items added.`, 'success');
        }
    }
};

// 4. Filtering Logic
function populateCategoryFilter(products) {
    const categoryFilter = document.getElementById("category-filter");
    if (!categoryFilter) return;
    
    // Get unique categories
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function filterAndSortProducts() {
    if (!window.allProducts) return;
    let filtered = [...window.allProducts];
    
    // Search 
    const searchInput = document.getElementById("search-input");
    if (searchInput && searchInput.value) {
        const term = searchInput.value.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(term));
    }

    // Category
    const categoryFilter = document.getElementById("category-filter");
    if (categoryFilter && categoryFilter.value !== "all") {
        filtered = filtered.filter(p => p.category === categoryFilter.value);
    }
    
    // Price Sorting
    const priceSort = document.getElementById("price-sort");
    if (priceSort && priceSort.value !== "default") {
        if (priceSort.value === "low_to_high") filtered.sort((a, b) => a.price - b.price);
        if (priceSort.value === "high_to_low") filtered.sort((a, b) => b.price - a.price);
    }

    displayProducts(filtered);
}

// 5. Initialization
document.addEventListener("DOMContentLoaded", () => {
    // Nav Logic
    const authLinks = document.querySelectorAll(".login-link-wrapper, .signup-link-wrapper");
    const userElement = document.querySelector(".nav-user-info");
    const logoutElement = document.querySelector(".logged-in-action");
    
    if (typeof navaAction === 'function') navaAction(authLinks, userElement, logoutElement);

    // Active Link Logic
    const navLinks = document.querySelectorAll("a.nav-link");
    if (typeof Activenav === 'function') Activenav(navLinks);

    // Initial Load
    getProducts();
    updateCartCount();

    // Event Listeners for Filters
    const inputs = ['search-input', 'category-filter', 'price-sort', 'rating-filter'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener(id === 'search-input' ? 'input' : 'change', filterAndSortProducts);
    });
});