document.addEventListener('DOMContentLoaded', () => {
    let cart = [];

    // Top Navigation Cart Link
    const cartCountSpan = document.getElementById('cart-count');
    const cartLink = document.getElementById('cart-link');
    
    // Slider Elements
    const cartSlider = document.getElementById('cart-slider');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalDiv = document.getElementById('cart-total');
    const totalAmountSpan = document.getElementById('total-amount');

    // ==========================================
    // 1. CART SLIDER OPEN/CLOSE LOGIC
    // ==========================================
    
    // Open cart when clicking nav link
    cartLink.addEventListener('click', (e) => {
        e.preventDefault(); 
        cartSlider.classList.add('open');
        cartOverlay.classList.add('active');
    });

    // Close cart function
    function closeCart() {
        cartSlider.classList.remove('open');
        cartOverlay.classList.remove('active');
    }

    // Close when clicking X or clicking the dark background
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // ==========================================
    // 2. ADD TO CART LOGIC
    // ==========================================
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const name = e.target.getAttribute('data-name');
            const price = parseFloat(e.target.getAttribute('data-price'));

            // Check if item is already in cart
            let existingItem = cart.find(item => item.name === name);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ name, price, quantity: 1 });
            }

            updateCartUI();
            
            alert(`${name} added to your cart! Click the Cart button to view.`);
        });
    });

    // ==========================================
    // 3. UPDATE UI LOGIC
    // ==========================================
    function updateCartUI() {
        // Update top navbar count
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.textContent = totalCount;

        // If empty, show empty message
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is currently empty.</p>';
            cartTotalDiv.style.display = 'none';
            return;
        }

        // Render items in slider
        let cartHTML = '';
        let totalPrice = 0;

        cart.forEach(item => {
            let itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;
            cartHTML += `
                <div class="cart-row">
                    <span>${item.name} <strong>(x${item.quantity})</strong></span>
                    <span style="color: #7b2c22; font-weight: bold;">₹${itemTotal}</span>
                </div>
            `;
        });

        cartItemsContainer.innerHTML = cartHTML;
        totalAmountSpan.textContent = totalPrice;
        cartTotalDiv.style.display = 'block';
    }
});