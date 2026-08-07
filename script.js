document.addEventListener('DOMContentLoaded', () => {
    let cart = [];

    // --- LOGIN & LOGOUT LOGIC ---
    const loginLink = document.getElementById('login-link');
    const loginModal = document.getElementById('login-modal');
    const closeLoginBtn = document.getElementById('close-login-btn');
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    const loginSubmitBtn = document.getElementById('login-submit-btn');
    const loginMessage = document.getElementById('login-message');
    const profileModal = document.getElementById('profile-modal');
    const closeProfileBtn = document.getElementById('close-profile-btn');
    const logoutBtn = document.getElementById('logout-btn');

    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (loginLink.textContent === 'Admin') {
            profileModal.classList.add('active');
        } else {
            loginModal.classList.add('active');
            setTimeout(() => usernameInput.focus(), 100);
        }
    });

    closeLoginBtn.addEventListener('click', () => {
        loginModal.classList.remove('active');
        loginMessage.textContent = ''; 
    });

    closeProfileBtn.addEventListener('click', () => {
        profileModal.classList.remove('active');
    });

    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loginSubmitBtn.click();
    });
    
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loginSubmitBtn.click();
    });

    loginSubmitBtn.addEventListener('click', () => {
        const user = usernameInput.value.trim();
        const pass = passwordInput.value.trim();

        if (user === 'admin' && pass === 'admin') {
            loginModal.classList.remove('active');
            loginLink.textContent = 'Admin';
            usernameInput.value = '';
            passwordInput.value = '';
            loginMessage.textContent = '';
        } else {
            loginMessage.style.color = '#c91818';
            loginMessage.textContent = 'Invalid username or password.';
        }
    });

    logoutBtn.addEventListener('click', () => {
        loginLink.textContent = 'Login';
        profileModal.classList.remove('active');
        window.location.href = '#home';
    });


    // --- CART LOGIC ---
    const cartCountSpan = document.getElementById('cart-count');
    const cartLink = document.getElementById('cart-link');
    const cartSlider = document.getElementById('cart-slider');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalDiv = document.getElementById('cart-total');
    const totalAmountSpan = document.getElementById('total-amount');

    cartLink.addEventListener('click', (e) => {
        e.preventDefault(); 
        cartSlider.classList.add('open');
        cartOverlay.classList.add('active');
    });

    function closeCart() {
        cartSlider.classList.remove('open');
        cartOverlay.classList.remove('active');
    }
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const name = e.target.getAttribute('data-name');
            const price = parseFloat(e.target.getAttribute('data-price'));
            cart.push({ name, price, quantity: 1 });
            updateAllUI();
        }
        else if (e.target.classList.contains('increase-qty')) {
            const name = e.target.getAttribute('data-name');
            const item = cart.find(i => i.name === name);
            if (item) { item.quantity += 1; updateAllUI(); }
        }
        else if (e.target.classList.contains('decrease-qty')) {
            const name = e.target.getAttribute('data-name');
            const item = cart.find(i => i.name === name);
            if (item) {
                item.quantity -= 1;
                if (item.quantity <= 0) { cart = cart.filter(i => i.name !== name); }
                updateAllUI();
            }
        }
        else if (e.target.classList.contains('remove-item-btn')) {
            const name = e.target.getAttribute('data-name');
            cart = cart.filter(i => i.name !== name);
            updateAllUI();
        }
    });

    function updateAllUI() {
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.textContent = totalCount;

        const productActionAreas = document.querySelectorAll('.product-actions');
        productActionAreas.forEach(area => {
            const name = area.getAttribute('data-name');
            const price = area.getAttribute('data-price');
            const itemInCart = cart.find(i => i.name === name);

            if (itemInCart) {
                area.innerHTML = `
                    <div class="qty-selector">
                        <button class="qty-btn decrease-qty" data-name="${name}">-</button>
                        <span class="qty-text">${itemInCart.quantity}</span>
                        <button class="qty-btn increase-qty" data-name="${name}">+</button>
                    </div>
                `;
            } else {
                area.innerHTML = `
                    <button class="add-to-cart-btn" data-name="${name}" data-price="${price}">Add to Cart</button>
                `;
            }
        });

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is currently empty.</p>';
            cartTotalDiv.style.display = 'none';
            return;
        }

        let cartHTML = '';
        let totalPrice = 0;

        cart.forEach(item => {
            let itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;
            cartHTML += `
                <div class="cart-row">
                    <div class="cart-item-info">
                        <span>${item.name}</span>
                        <span style="color: #7b2c22;">₹${itemTotal}</span>
                    </div>
                    <div class="cart-item-actions">
                        <div class="qty-selector">
                            <button class="qty-btn decrease-qty" data-name="${item.name}">-</button>
                            <span class="qty-text" style="color:white;">${item.quantity}</span>
                            <button class="qty-btn increase-qty" data-name="${item.name}">+</button>
                        </div>
                        <button class="remove-item-btn" data-name="${item.name}">Remove</button>
                    </div>
                </div>
            `;
        });

        cartItemsContainer.innerHTML = cartHTML;
        totalAmountSpan.textContent = totalPrice;
        cartTotalDiv.style.display = 'block';
    }

    // --- CHECKOUT LOGIC ---
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    checkoutBtn.addEventListener('click', () => {
        if (loginLink.textContent !== 'Admin') {
            closeCart();
            loginModal.classList.add('active');
            setTimeout(() => usernameInput.focus(), 100);
            
            loginMessage.style.color = '#c91818';
            loginMessage.textContent = 'You must log in to proceed to checkout.';
            
        } else {
            let orderSummary = "Hello Soni Mehndi Artist! I would like to place an order:%0A%0A";
            cart.forEach(item => {
                orderSummary += `- ${item.name} (x${item.quantity}) = ₹${item.price * item.quantity}%0A`;
            });
            orderSummary += `%0ATotal Amount: ₹${totalAmountSpan.textContent}`;
            
            window.open(`https://wa.me/919413425400?text=${orderSummary}`, '_blank');
        }
    });

});