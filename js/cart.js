// Cart functionality
class ShoppingCart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        this.renderCart();
        this.attachEventListeners();
        this.updateSummary();
    }

    renderCart() {
        const cartItemsList = document.getElementById('cart-items-list');
        const emptyCart = document.getElementById('empty-cart');

        if (this.cart.length === 0) {
            cartItemsList.style.display = 'none';
            emptyCart.style.display = 'block';
            return;
        }

        cartItemsList.style.display = 'block';
        emptyCart.style.display = 'none';

        cartItemsList.innerHTML = this.cart.map((item, index) => `
            <div class="cart-item" data-index="${index}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn decrease" data-index="${index}">-</button>
                            <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-index="${index}">
                            <button class="quantity-btn increase" data-index="${index}">+</button>
                        </div>
                        <button class="remove-btn" data-index="${index}">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    attachEventListeners() {
        // Quantity controls
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quantity-btn')) {
                const index = parseInt(e.target.dataset.index);
                const isIncrease = e.target.classList.contains('increase');

                if (isIncrease) {
                    this.updateQuantity(index, this.cart[index].quantity + 1);
                } else {
                    if (this.cart[index].quantity > 1) {
                        this.updateQuantity(index, this.cart[index].quantity - 1);
                    }
                }
            }

            if (e.target.classList.contains('remove-btn') || e.target.closest('.remove-btn')) {
                const index = parseInt(e.target.dataset.index || e.target.closest('.remove-btn').dataset.index);
                this.removeItem(index);
            }
        });

        // Quantity input change
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('quantity-input')) {
                const index = parseInt(e.target.dataset.index);
                const newQuantity = parseInt(e.target.value);

                if (newQuantity > 0) {
                    this.updateQuantity(index, newQuantity);
                } else {
                    e.target.value = this.cart[index].quantity;
                }
            }
        });

        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.proceedToCheckout();
            });
        }

        // Continue shopping
        const continueBtn = document.getElementById('continue-shopping');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                window.location.href = 'products.html';
            });
        }
    }

    updateQuantity(index, newQuantity) {
        this.cart[index].quantity = newQuantity;
        this.saveCart();
        this.renderCart();
        this.updateSummary();
    }

    removeItem(index) {
        // SweetAlert confirmation
        Swal.fire({
            title: 'Remove Item?',
            text: 'Are you sure you want to remove this item from your cart?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#95a5a6',
            confirmButtonText: 'Yes, remove it!'
        }).then((result) => {
            if (result.isConfirmed) {
                this.cart.splice(index, 1);
                this.saveCart();
                this.renderCart();
                this.updateSummary();

                Swal.fire({
                    icon: 'success',
                    title: 'Removed!',
                    text: 'Item has been removed from your cart.',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    }

    updateSummary() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + shipping + tax;

        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('shipping').textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
        document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    }

    proceedToCheckout() {
        const currentUser = localStorage.getItem('currentUser');

        if (!currentUser) {
            Swal.fire({
                title: 'Login Required',
                text: 'Please log in to proceed with checkout.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#A47E53',
                cancelButtonColor: '#95a5a6',
                confirmButtonText: 'Login',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = 'login.html';
                }
            });
            return;
        }

        if (this.cart.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Empty Cart',
                text: 'Add some items to your cart before checkout.'
            });
            return;
        }

        // Show loading state
        const checkoutBtn = document.getElementById('checkout-btn');
        const originalText = checkoutBtn.innerHTML;
        checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        checkoutBtn.disabled = true;

        // Simulate checkout process
        setTimeout(() => {
            Swal.fire({
                title: 'Order Placed Successfully! 🎉',
                text: 'Thank you for your purchase. You will receive a confirmation email shortly.',
                icon: 'success',
                confirmButtonColor: '#A47E53'
            }).then(() => {
                // Clear cart and redirect
                localStorage.removeItem('cart');
                window.location.href = 'index.html';
            });
        }, 2000);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    addItem(product) {
        const existingItem = this.cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        this.saveCart();
        this.renderCart();
        this.updateSummary();
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cart = new ShoppingCart();
});
