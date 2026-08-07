document.addEventListener('DOMContentLoaded', () => {
    let cart = [];
    let currentUser = null; 
    let addressesList = []; // Dynamic list of saved delivery addresses

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

    // New Address Modal elements
    const triggerAddAddressBtn = document.getElementById('trigger-add-address-modal');
    const newAddressModal = document.getElementById('new-address-modal');
    const closeNewAddressBtn = document.getElementById('close-new-address-btn');
    const addContactPerson = document.getElementById('add-contact-person');
    const addEmail = document.getElementById('add-email');
    const addMobile = document.getElementById('add-mobile');
    const addFullAddress = document.getElementById('add-full-address');
    const addPincode = document.getElementById('add-pincode');
    const addTagType = document.getElementById('add-tag-type');
    const saveAddressBtn = document.getElementById('save-address-btn');
    const addressFormMsg = document.getElementById('address-form-msg');
    const addressCardsList = document.getElementById('address-cards-list');

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

    // Add New Address Modal Toggle
    triggerAddAddressBtn.addEventListener('click', () => {
        newAddressModal.classList.add('active');
        addressFormMsg.textContent = '';
    });

    closeNewAddressBtn.addEventListener('click', () => {
        newAddressModal.classList.remove('active');
    });

    // Save New Address
    saveAddressBtn.addEventListener('click', () => {
        const contactPerson = addContactPerson.value.trim();
        const email = addEmail.value.trim();
        const mobile = addMobile.value.trim();
        const fullAddr = addFullAddress.value.trim();
        const pincode = addPincode.value.trim();
        const tag = addTagType.value;

        if (!contactPerson || !email || !mobile || !fullAddr || !pincode) {
            addressFormMsg.style.color = '#c91818';
            addressFormMsg.textContent = 'Please fill out all address details.';
            return;
        }

        const newAddressObj = {
            id: Date.now(),
            contactPerson,
            email,
            mobile,
            fullAddr: `${fullAddr}, ${pincode}`,
            tag
        };

        addressesList.push(newAddressObj);
        renderAddressCards();

        // Clear and close modal
        addContactPerson.value = '';
        addEmail.value = '';
        addMobile.value = '';
        addFullAddress.value = '';
        addPincode.value = '';
        addressFormMsg.textContent = '';
        newAddressModal.classList.remove('active');
    });

    function renderAddressCards() {
        if (addressesList.length === 0) {
            addressCardsList.innerHTML = '<p id="empty-address-msg" class="empty-address-msg">No delivery address available.</p>';
            return;
        }

        let html = '';
        addressesList.forEach((addr, index) => {
            const isSelected = index === 0 ? 'selected-card' : '';
            html += `
                <div class="ui-address-card ${isSelected}">
                    <div class="ui-card-header">
                        <span class="ui-card-name">${addr.contactPerson}</span>
                        <span class="ui-card-tag">${addr.tag}</span>
                        <span class="ui-card-more">&#8942;</span>
                    </div>
                    <p class="ui-card-address">${addr.fullAddr}</p>
                    <p class="ui-card-contact">${addr.email}</p>
                    <p class="ui-card-contact">${addr.mobile}</p>
                    <button class="deliver-here-btn" data-id="${addr.id}">Deliver Here</button>
                </div>
            `;
        });

        addressCardsList.innerHTML = html;
    }

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

        if (mobile === '123456' && pass === '123456') {
            currentUser = { name: 'admin', mobile: '123456' };
        } else if (mobile === '9413425400' && pass === 'admin') {
            currentUser = { name: 'admin', mobile: '9413425400' };
        } else if (mobile) {
            currentUser = { name: 'User (' + mobile.slice(-4) + ')', mobile: mobile };
        } else {
            loginMessage.style.color = '#c91818';
            loginMessage.textContent = 'Invalid mobile number or password.';
            return;
        }

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

        currentUser = { name: name, mobile: mobile };
        registerModal.classList.remove('active');
        
        loginLink.textContent = currentUser.name;

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


    // --- CART & ADDRESS SLIDER LOGIC ---
    const cartBadge = document.getElementById('cart-badge');
    const cartHeaderCount = document.getElementById('cart-header-count');
    const cartLink = document.getElementById('cart-link');
    const cartSlider = document.getElementById('cart-slider');
    const addressSlider = document.getElementById('address-slider');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartBtn = document.getElementById('close-cart');
    const closeAddressBtn = document.getElementById('close-address');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalDiv = document.getElementById('cart-total');
    const totalAmountSpan = document.getElementById('total-amount');
    const gotoDeliveryBtn = document.getElementById('goto-delivery-btn');

    cartLink.addEventListener('click', (e) => {
        e.preventDefault(); 
        addressSlider.classList.remove('open');
        cartSlider.classList.add('open');
        cartOverlay.classList.add('active');
    });

    function closeAllSliders() {
        cartSlider.classList.remove('open');
        addressSlider.classList.remove('open');
        cartOverlay.classList.remove('active');
    }

    closeCartBtn.addEventListener('click', closeAllSliders);
    closeAddressBtn.addEventListener('click', closeAllSliders);
    cartOverlay.addEventListener('click', closeAllSliders);

    // Open Delivery Address tab from Cart Slider
    gotoDeliveryBtn.addEventListener('click', () => {
        if (!currentUser) {
            closeAllSliders();
            loginModal.classList.add('active');
            setTimeout(() => mobileInput.focus(), 100);
            loginMessage.style.color = '#c91818';
            loginMessage.textContent = 'You must log in to proceed to delivery address.';
        } else {
            cartSlider.classList.remove('open');
            addressSlider.classList.add('open');
        }
    });

    // Handle "Deliver Here" click -> WhatsApp redirect with full order & address summary
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('deliver-here-btn')) {
            const addrId = parseInt(e.target.getAttribute('data-id'));
            const chosenAddr = addressesList.find(a => a.id === addrId);

            if (chosenAddr) {
                let orderSummary = `Hello Soni Mehndi Artist! I would like to place an order:%0A%0A` +
                    `*Customer:* ${chosenAddr.contactPerson}%0A` +
                    `*Mobile:* ${chosenAddr.mobile}%0A` +
                    `*Email:* ${chosenAddr.email}%0A` +
                    `*Delivery Address (${chosenAddr.tag}):* ${chosenAddr.fullAddr}%0A%0A` +
                    `*Order Items:*%0A`;

                cart.forEach(item => {
                    orderSummary += `- ${item.name} (${item.unit}) x${item.quantity} = ₹${item.price * item.quantity}%0A`;
                });

                orderSummary += `%0A*Estimated Total:* ₹${totalAmountSpan.textContent}`;

                window.open(`https://wa.me/919413425400?text=${orderSummary}`, '_blank');
            }
        }
        else if (e.target.classList.contains('add-to-cart-btn')) {
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
});