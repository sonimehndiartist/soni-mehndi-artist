document.addEventListener('DOMContentLoaded', () => {
    let cart = [];
    let currentUser = null; // Stores object: { name, mobile }

    // --- LOGIN & REGISTER LOGIC ---
    const loginLink = document.getElementById('login-link');
    const loginModal = document.getElementById('login-modal');
    const closeLoginBtn = document.getElementById('close-login-btn');
    
    const mobileInput = document.getElementById('mobile-input');
    const passwordInput = document.getElementById('password-input');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    const loginMessage = document.getElementById('login-message');

    // Register Modal elements
    const openRegisterBtn = document.getElementById('open-register-btn');
    const registerModal = document.getElementById('register-modal');
    const closeRegisterBtn = document.getElementById('close-register-btn');
    const regNameInput = document.getElementById('reg-name-input');
    const regMobileInput = document.getElementById('reg-mobile-input');
    const regPasswordInput = document.getElementById('reg-password-input');
    const regAddressInput = document.getElementById('reg-address-input');
    const regPincodeInput = document.getElementById('reg-pincode-input');
    const regRemarksInput = document.getElementById('reg-remarks-input');
    const registerSubmitBtn = document.getElementById('register-submit-btn');
    const registerMessage = document.getElementById('register-message');
    const backToLoginBtn = document.getElementById('back-to-login-btn');

    // Profile elements
    const profileModal = document.getElementById('profile-modal');
    const closeProfileBtn = document.getElementById('close-profile-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const profileNameDisplay = document.getElementById('profile-name-display');
    const profileMobileDisplay = document.getElementById('profile-mobile-display');

    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentUser) {
            profileNameDisplay.textContent = currentUser.name;
            profileMobileDisplay.textContent = currentUser.mobile;
            profileModal.classList.add('active');
        } else {
            loginModal.classList.add('active');
            setTimeout(() => mobileInput.focus(), 100);
        }
    });

    closeLoginBtn.addEventListener('click', () => {
        loginModal.classList.remove('active');
        loginMessage.textContent = ''; 
    });

    closeProfileBtn.addEventListener('click', () => {
        profileModal.classList.remove('active');
    });

    openRegisterBtn.addEventListener('click', () => {
        loginModal.classList.remove('active');
        loginMessage.textContent = '';
        registerModal.classList.add('active');
        setTimeout(() => regNameInput.focus(), 100);
    });

    closeRegisterBtn.addEventListener('click', () => {
        registerModal.classList.remove('active');
        registerMessage.textContent = '';
    });

    backToLoginBtn.addEventListener('click', () => {
        registerModal.classList.remove('active');
        registerMessage.textContent = '';
        loginModal.classList.add('active');
        setTimeout(() => mobileInput.focus(), 100);
    });

    [mobileInput, passwordInput].forEach(input => {
        if(input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') authSubmitBtn.click();
            });
        }
    });

    authSubmitBtn.addEventListener('click', () => {
        const mobile = mobileInput.value.trim();
        const pass = passwordInput.value.trim();

        if (!mobile || !pass) {
            loginMessage.style.color = '#c91818';
            loginMessage.textContent = 'Please fill in mobile number and password.';
            return;
        }

        // Check for temporary credentials 123456 / 123456 or 9413425400 / admin
        if (mobile === '123456' && pass === '123456') {
            currentUser = { name: 'admin', mobile: '123456' };
        } else if (mobile === '9413425400' && pass === 'admin') {
            currentUser = { name: 'admin', mobile: '9413425400' };
        } else if (mobile) {
            // General test fallback login
            currentUser = { name: 'User (' + mobile.slice(-4) + ')', mobile: mobile };
        } else {
            loginMessage.style.color = '#c91818';
            loginMessage.textContent = 'Invalid mobile number or password.';
            return;
        }

        // On successful login: update navigation bar link text to the user's name
        loginModal.classList.remove('active');
        loginLink.textContent = currentUser.name;
        mobileInput.value = '';
        passwordInput.value = '';
        loginMessage.textContent = '';
    });

    registerSubmitBtn.addEventListener('click', () => {
        const name = regNameInput.value.trim();
        const mobile = regMobileInput.value.trim();
        const pass = regPasswordInput.value.trim();
        const address = regAddressInput.value.trim();
        const pincode = regPincodeInput.value.trim();

        if (!name || !mobile || !pass || !address || !pincode) {
            registerMessage.style.color = '#c91818';
            registerMessage.textContent = 'Please fill out all required fields.';
            return;
        }

        // Set logged in user info from registration
        currentUser = { name: name, mobile: mobile };
        registerModal.classList.remove('active');
        
        // Update navigation bar text
        loginLink.textContent = currentUser.name;

        // Clear register inputs
        regNameInput.value = '';
        regMobileInput.value = '';
        regPasswordInput.value = '';
        regAddressInput.value = '';
        regPincodeInput.value = '';
        regRemarksInput.value = '';
        registerMessage.textContent = '';

        alert(`Registration successful! Welcome, ${currentUser.name}. You are now logged in.`);
    });

    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        loginLink.textContent = 'Login';
        profileModal.classList.remove('active');
        window.location.href = '#home';
    });


    // --- CART LOGIC ---
    const cartBadge = document.getElementById('cart-badge');
    const cartHeaderCount = document.getElementById('cart-header-count');
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
            const unit = e.target.getAttribute('data-unit');
            const price = parseFloat(e.target.getAttribute('data-price'));
            cart.push({ name, unit, price, quantity: 1 });
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
        
        cartHeaderCount.textContent = `${totalCount} ${totalCount === 1 ? 'Item' : 'Items'}`;

        cartBadge.textContent = totalCount;
        if (totalCount > 0) {
            cartBadge.style.display = 'flex';
        } else {
            cartBadge.style.display = 'none';
        }

        const productActionAreas = document.querySelectorAll('.product-actions');
        productActionAreas.forEach(area => {
            const name = area.getAttribute('data-name');
            const unit = area.getAttribute('data-unit');
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
                    <button class="add-to-cart-btn" data-name="${name}" data-unit="${unit}" data-price="${price}">Add to Cart</button>
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
                        <span>${item.name} (${item.unit})</span>
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

    cartBadge.style.display = 'none';

    // --- CHECKOUT LOGIC ---
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    checkoutBtn.addEventListener('click', () => {
        if (!currentUser) {
            closeCart();
            loginModal.classList.add('active');
            setTimeout(() => mobileInput.focus(), 100);
            
            loginMessage.style.color = '#c91818';
            loginMessage.textContent = 'You must log in to proceed to checkout.';
        } else {
            let orderSummary = `Hello Soni Mehndi Artist! I would like to place an order:%0A%0AUser: ${currentUser.name}%0AMobile: ${currentUser.mobile}%0A%0AOrder Items:%0A`;
            cart.forEach(item => {
                orderSummary += `- ${item.name} (${item.unit}) x${item.quantity} = ₹${item.price * item.quantity}%0A`;
            });
            orderSummary += `%0AEstimated Total: ₹${totalAmountSpan.textContent}`;
            
            window.open(`https://wa.me/919413425400?text=${orderSummary}`, '_blank');
        }
    });

});