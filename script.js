document.addEventListener('DOMContentLoaded', () => {
    let cart = [];

    // --- LOCATION LOGIC ---
    const locationModal = document.getElementById('location-modal');
    const stateInput = document.getElementById('state-input');
    const checkLocationBtn = document.getElementById('check-location-btn');
    const autoDetectBtn = document.getElementById('auto-detect-btn');
    const locationMessage = document.getElementById('location-message');
    const mainContent = document.getElementById('main-content');
    const navLocationText = document.getElementById('nav-location-text');

    const indianStates = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
        "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
        "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
        "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
    ];

    stateInput.addEventListener('input', (e) => {
        const val = stateInput.value;
        if (val.length >= 2 && e.inputType !== 'deleteContentBackward') {
            const match = indianStates.find(state => state.toLowerCase().startsWith(val.toLowerCase()));
            if (match) {
                stateInput.value = match;
                stateInput.setSelectionRange(val.length, match.length);
            }
        }
    });

    checkLocationBtn.addEventListener('click', () => {
        const userState = stateInput.value.trim().toLowerCase();
        validateState(userState, stateInput.value.trim());
    });

    // Pressing Enter in the location input will also trigger the check
    stateInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkLocationBtn.click();
        }
    });

    autoDetectBtn.addEventListener('click', () => {
        locationMessage.style.color = '#6b5b53';
        locationMessage.textContent = 'Locating... Please allow location access.';

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;

                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                        .then(response => response.json())
                        .then(data => {
                            const address = data.address;
                            const state = address.state;
                            const city = address.city || address.town || address.county || '';
                            const area = address.suburb || address.neighbourhood || address.residential || '';

                            if (state) {
                                stateInput.value = state; 
                                let fullLocationString = '';
                                if (area) fullLocationString += area + ', ';
                                if (city) fullLocationString += city + ', ';
                                fullLocationString += state;

                                validateState(state.toLowerCase(), fullLocationString); 
                            } else {
                                locationMessage.style.color = '#c91818';
                                locationMessage.textContent = 'Could not determine your state automatically. Please type it manually.';
                            }
                        })
                        .catch(error => {
                            locationMessage.style.color = '#c91818';
                            locationMessage.textContent = 'Network error. Please type your state manually.';
                        });
                },
                (error) => {
                    locationMessage.style.color = '#c91818';
                    locationMessage.textContent = 'Location access denied or unavailable. Please type it manually.';
                }
            );
        } else {
            locationMessage.style.color = '#c91818';
            locationMessage.textContent = 'Geolocation is not supported by your browser. Please type it manually.';
        }
    });

    function validateState(stateName, locationStringToDisplay) {
        if (stateName === 'gujarat') {
            locationModal.classList.remove('active');
            mainContent.classList.remove('hidden');
            
            if (locationStringToDisplay) {
                navLocationText.textContent = locationStringToDisplay;
            } else {
                navLocationText.textContent = 'Gujarat, India';
            }
        } else {
            locationMessage.style.color = '#c91818';
            locationMessage.textContent = `You are in ${stateName.charAt(0).toUpperCase() + stateName.slice(1)}. Sorry, our products are currently only available in Gujarat.`;
        }
    }

    // --- LOGIN & LOGOUT LOGIC ---
    const loginLink = document.getElementById('login-link');
    const loginModal = document.getElementById('login-modal');
    const closeLoginBtn = document.getElementById('close-login-btn');
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    const loginSubmitBtn = document.getElementById('login-submit-btn');
    const loginMessage = document.getElementById('login-message');

    // Profile elements
    const profileModal = document.getElementById('profile-modal');
    const closeProfileBtn = document.getElementById('close-profile-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // Show modal when clicking Login or Admin in navigation
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (loginLink.textContent === 'Admin') {
            // If already logged in, show the profile modal
            profileModal.classList.add('active');
        } else {
            // If not logged in, show the login modal
            loginModal.classList.add('active');
            // Auto-focus the username input when the modal opens
            setTimeout(() => usernameInput.focus(), 100);
        }
    });

    // Close Login modal
    closeLoginBtn.addEventListener('click', () => {
        loginModal.classList.remove('active');
        loginMessage.textContent = ''; 
    });

    // Close Profile modal
    closeProfileBtn.addEventListener('click', () => {
        profileModal.classList.remove('active');
    });

    // Allow pressing "Enter" to trigger the Login button
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginSubmitBtn.click();
        }
    });
    
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginSubmitBtn.click();
        }
    });

    // Handle Login Submit
    loginSubmitBtn.addEventListener('click', () => {
        const user = usernameInput.value.trim();
        const pass = passwordInput.value.trim();

        if (user === 'admin' && pass === 'admin') {
            // Success! Close modal and change link text
            loginModal.classList.remove('active');
            loginLink.textContent = 'Admin';
            
            // Clear out inputs for security
            usernameInput.value = '';
            passwordInput.value = '';
            loginMessage.textContent = '';
        } else {
            // Fail! Show error message
            loginMessage.style.color = '#c91818';
            loginMessage.textContent = 'Invalid username or password.';
        }
    });

    // Handle Logout
    logoutBtn.addEventListener('click', () => {
        // Change the navbar link back to 'Login'
        loginLink.textContent = 'Login';
        
        // Hide the profile modal
        profileModal.classList.remove('active');
        
        // Scroll the user back to the home page smoothly
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
            
            // Auto-focus the username input when forced to log in
            setTimeout(() => usernameInput.focus(), 100);
            
            loginMessage.style.color = '#c91818';
            loginMessage.textContent = 'You must log in to proceed to checkout.';
            
        } else {
            let orderSummary = "Hello Soni Mehndi Artist! I would like to place an order:\n\n";
            cart.forEach(item => {
                orderSummary += `- ${item.name} (x${item.quantity}) = ₹${item.price * item.quantity}\n`;
            });
            orderSummary += `\nTotal Amount: ₹${totalAmountSpan.textContent}`;
            
            alert("This will redirect to WhatsApp with the following message:\n\n" + orderSummary);
        }
    });

});