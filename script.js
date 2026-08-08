document.addEventListener('DOMContentLoaded', () => {
    let cart = [];
    let currentUser = null; 
    let addressesList = []; 
    let selectedAddress = null; 
    let editingAddressId = null; 
    let pendingRedirectToAddress = false; 
    let currentCoords = null; // Stores { lat, lng } when fetched
    const SHIPPING_CHARGE = 150;

    // Leaflet Map variables
    let addressMap = null;
    let mapMarker = null;

    const floatingWhatsapp = document.getElementById('floating-whatsapp');
    const locationCoordsDisplay = document.getElementById('location-coords-display');

    function updateWhatsappVisibility() {
        const isCartOpen = cartSlider.classList.contains('open');
        const isAddressOpen = addressSlider.classList.contains('open');

        if (isCartOpen || isAddressOpen) {
            floatingWhatsapp.classList.add('hidden');
        } else {
            floatingWhatsapp.classList.remove('hidden');
        }
    }

    // --- LEAFLET MAP & GEOLOCATION LOGIC ---
    function initAddressMap(lat = 23.0225, lng = 72.5714) { // Default Ahmedabad coordinates
        setTimeout(() => {
            if (!addressMap) {
                addressMap = L.map('address-map').setView([lat, lng], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '© OpenStreetMap'
                }).addTo(addressMap);

                mapMarker = L.marker([lat, lng], { draggable: true }).addTo(addressMap);

                mapMarker.on('dragend', function() {
                    const pos = mapMarker.getLatLng();
                    recordCoordinates(pos.lat, pos.lng);
                });

                addressMap.on('click', function(e) {
                    mapMarker.setLatLng(e.latlng);
                    recordCoordinates(e.lat, e.lng);
                });
            } else {
                addressMap.setView([lat, lng], 13);
                mapMarker.setLatLng([lat, lng]);
            }
            addressMap.invalidateSize();
        }, 300);
    }

    function recordCoordinates(lat, lng) {
        currentCoords = { lat: lat.toFixed(5), lng: lng.toFixed(5) };
        locationCoordsDisplay.textContent = `Captured GPS: Lat ${currentCoords.lat}, Lng ${currentCoords.lng}`;
        reverseGeocodePincodeOnly(lat, lng);
    }

    // Extracted Pincode only from Nominatim without overwriting full address text
    function reverseGeocodePincodeOnly(lat, lng) {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
                if (data) {
                    const addressObj = data.address || {};
                    let foundPin = addressObj.postcode;
                    if (!foundPin && data.display_name) {
                        const match = data.display_name.match(/\b\d{6}\b/);
                        if (match) foundPin = match[0];
                    }

                    if (foundPin) {
                        addPincode.value = foundPin;
                    }
                }
            })
            .catch(err => console.log('Pincode fetch error:', err));
    }

    // Fetch Current Location Button Click
    document.getElementById('fetch-location-btn').addEventListener('click', () => {
        const btn = document.getElementById('fetch-location-btn');
        btn.textContent = "⌛ Fetching Location...";

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    initAddressMap(lat, lng);
                    recordCoordinates(lat, lng);
                    btn.textContent = "📍 Fetch Current Location";
                },
                (err) => {
                    btn.textContent = "📍 Fetch Current Location";
                    alert('Could not fetch location. Please check browser location permissions or click on the map directly.');
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            btn.textContent = "📍 Fetch Current Location";
            alert('Geolocation is not supported by your browser.');
        }
    });

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

    // Address Modal elements
    const triggerAddAddressBtn = document.getElementById('trigger-add-address-modal');
    const newAddressModal = document.getElementById('new-address-modal');
    const closeNewAddressBtn = document.getElementById('close-new-address-btn');
    const addressModalTitle = document.getElementById('address-modal-title');
    const addContactPerson = document.getElementById('add-contact-person');
    const addEmail = document.getElementById('add-email');
    const addMobile = document.getElementById('add-mobile');
    const addFullAddress = document.getElementById('add-full-address');
    const addPincode = document.getElementById('add-pincode');
    const addTagType = document.getElementById('add-tag-type');
    const addCustomTag = document.getElementById('add-custom-tag');
    const saveAddressBtn = document.getElementById('save-address-btn');
    const addressFormMsg = document.getElementById('address-form-msg');
    const addressCardsList = document.getElementById('address-cards-list');

    // Toggle Custom Tag Input Field
    addTagType.addEventListener('change', () => {
        if (addTagType.value === 'Other') {
            addCustomTag.classList.remove('hidden');
        } else {
            addCustomTag.classList.add('hidden');
            addCustomTag.value = '';
        }
    });

    // Profile elements
    const profileModal = document.getElementById('profile-modal');
    const closeProfileBtn = document.getElementById('close-profile-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const profileNameDisplay = document.getElementById('profile-name-display');
    const profileMobileDisplay = document.getElementById('profile-mobile-display');

    // Cart tab Address elements
    const cartSelectedAddressBox = document.getElementById('cart-selected-address-box');
    const cartAddrName = document.getElementById('cart-addr-name');
    const cartAddrText = document.getElementById('cart-addr-text');
    const changeAddressBtn = document.getElementById('change-address-btn');
    const shippingRow = document.getElementById('shipping-row');
    const cartSubtotalVal = document.getElementById('cart-subtotal-val');
    const totalLabelText = document.getElementById('total-label-text');

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

    // Open Modal for "Add New Address" (Form strictly requires user input)
    triggerAddAddressBtn.addEventListener('click', () => {
        editingAddressId = null;
        currentCoords = null;
        locationCoordsDisplay.textContent = '';
        addressModalTitle.textContent = 'Add Delivery Address';
        addContactPerson.value = '';
        addEmail.value = '';
        addMobile.value = '';
        addFullAddress.value = '';
        addPincode.value = '';
        addTagType.value = 'Home';
        addCustomTag.value = '';
        addCustomTag.classList.add('hidden');
        addressFormMsg.textContent = '';
        newAddressModal.classList.add('active');
        initAddressMap();
    });

    closeNewAddressBtn.addEventListener('click', () => {
        newAddressModal.classList.remove('active');
    });

    // Save or Update Address (Strict Validation & Custom Tag)
    saveAddressBtn.addEventListener('click', () => {
        const contactPerson = addContactPerson.value.trim();
        const email = addEmail.value.trim();
        const mobile = addMobile.value.trim();
        const fullAddr = addFullAddress.value.trim();
        const pincode = addPincode.value.trim();
        
        let tag = addTagType.value;
        if (tag === 'Other') {
            const customTagVal = addCustomTag.value.trim();
            if (!customTagVal) {
                addressFormMsg.style.color = '#c91818';
                addressFormMsg.textContent = 'Please specify custom tag name.';
                return;
            }
            tag = customTagVal;
        }

        // Strict Mandatory Validation
        if (!contactPerson || !mobile || !fullAddr || !pincode) {
            addressFormMsg.style.color = '#c91818';
            addressFormMsg.textContent = 'Contact Person, Mobile Number, Full Address, and Pin Code are required.';
            return;
        }

        const formattedAddress = `${fullAddr}, ${pincode}`;

        if (editingAddressId !== null) {
            const addrIndex = addressesList.findIndex(a => a.id === editingAddressId);
            if (addrIndex !== -1) {
                addressesList[addrIndex] = {
                    id: editingAddressId,
                    contactPerson,
                    email,
                    mobile,
                    fullAddr: formattedAddress,
                    tag,
                    coords: currentCoords ? { ...currentCoords } : addressesList[addrIndex].coords
                };
                if (selectedAddress && selectedAddress.id === editingAddressId) {
                    selectedAddress = addressesList[addrIndex];
                }
            }
        } else {
            const newAddressObj = {
                id: Date.now(),
                contactPerson,
                email,
                mobile,
                fullAddr: formattedAddress,
                tag,
                coords: currentCoords ? { ...currentCoords } : null
            };
            addressesList.push(newAddressObj);
        }

        renderAddressCards();
        updateAllUI();

        addContactPerson.value = '';
        addEmail.value = '';
        addMobile.value = '';
        addFullAddress.value = '';
        addPincode.value = '';
        addCustomTag.value = '';
        addCustomTag.classList.add('hidden');
        addressFormMsg.textContent = '';
        editingAddressId = null;
        newAddressModal.classList.remove('active');
    });

    function renderAddressCards() {
        if (addressesList.length === 0) {
            addressCardsList.innerHTML = '<p id="empty-address-msg" class="empty-address-msg">No delivery address available.</p>';
            return;
        }

        let html = '';
        addressesList.forEach((addr, index) => {
            const isSelected = selectedAddress && selectedAddress.id === addr.id ? 'selected-card' : (index === 0 && !selectedAddress ? 'selected-card' : '');
            html += `
                <div class="ui-address-card ${isSelected}">
                    <div class="ui-card-header">
                        <span class="ui-card-name">${addr.contactPerson}</span>
                        <span class="ui-card-tag">${addr.tag}</span>
                        
                        <div class="ui-card-more-container">
                            <span class="ui-card-more" data-id="${addr.id}">&#8942;</span>
                            <div class="card-menu-dropdown" id="dropdown-${addr.id}">
                                <button class="card-menu-item edit-addr-btn" data-id="${addr.id}">Edit</button>
                                <button class="card-menu-item delete-item delete-addr-btn" data-id="${addr.id}">Delete</button>
                            </div>
                        </div>
                    </div>
                    <p class="ui-card-address">${addr.fullAddr}</p>
                    <p class="ui-card-contact">${addr.email ? addr.email : ''}</p>
                    <p class="ui-card-contact">${addr.mobile}</p>
                    ${addr.coords ? `<p style="font-size: 0.75rem; color: #2e7d32; margin-top: 4px;">📍 GPS: Lat ${addr.coords.lat}, Lng ${addr.coords.lng}</p>` : ''}
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

        if (pendingRedirectToAddress) {
            pendingRedirectToAddress = false;
            addressSlider.classList.add('open');
            cartOverlay.classList.add('active');
            updateWhatsappVisibility();
        }
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

        if (pendingRedirectToAddress) {
            pendingRedirectToAddress = false;
            addressSlider.classList.add('open');
            cartOverlay.classList.add('active');
            updateWhatsappVisibility();
        }
    });

    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        selectedAddress = null;
        loginLink.textContent = 'Login';
        profileModal.classList.remove('active');
        updateAllUI();
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
        updateWhatsappVisibility();
    });

    function closeAllSliders() {
        cartSlider.classList.remove('open');
        addressSlider.classList.remove('open');
        cartOverlay.classList.remove('active');
        updateWhatsappVisibility();
    }

    closeCartBtn.addEventListener('click', closeAllSliders);
    closeAddressBtn.addEventListener('click', closeAllSliders);
    cartOverlay.addEventListener('click', closeAllSliders);

    gotoDeliveryBtn.addEventListener('click', () => {
        if (selectedAddress && gotoDeliveryBtn.textContent === "Make Payment Now") {
            let orderSummary = `Hello Soni Mehndi Artist! I would like to place an order:%0A%0A` +
                `*Customer:* ${selectedAddress.contactPerson}%0A` +
                `*Mobile:* ${selectedAddress.mobile}%0A` +
                (selectedAddress.email ? `*Email:* ${selectedAddress.email}%0A` : '') +
                `*Delivery Address (${selectedAddress.tag}):* ${selectedAddress.fullAddr}%0A` +
                (selectedAddress.coords ? `*Location Coordinates:* Lat ${selectedAddress.coords.lat}, Lng ${selectedAddress.coords.lng}%0A` : '') +
                `%0A*Order Items:*%0A`;

            let subtotal = 0;
            cart.forEach(item => {
                let itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                orderSummary += `- ${item.name} (${item.unit}) x${item.quantity} = ₹${itemTotal}%0A`;
            });

            orderSummary += `%0A*Subtotal:* ₹${subtotal}` +
                `%0A*Shipping Charges:* ₹${SHIPPING_CHARGE}` +
                `%0A*Total Amount Payable:* ₹${subtotal + SHIPPING_CHARGE}`;

            window.open(`https://wa.me/919413425400?text=${orderSummary}`, '_blank');
            return;
        }

        if (!currentUser) {
            closeAllSliders();
            pendingRedirectToAddress = true; 
            loginModal.classList.add('active');
            setTimeout(() => mobileInput.focus(), 100);
            loginMessage.style.color = '#c91818';
            loginMessage.textContent = 'Please log in to continue to delivery address.';
        } else {
            cartSlider.classList.remove('open');
            addressSlider.classList.add('open');
            updateWhatsappVisibility();
        }
    });

    changeAddressBtn.addEventListener('click', () => {
        cartSlider.classList.remove('open');
        addressSlider.classList.add('open');
        updateWhatsappVisibility();
    });

    // Event Delegation for Card Actions & Dropdowns
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('ui-card-more')) {
            e.stopPropagation();
            const id = parseInt(e.target.getAttribute('data-id'));
            const dropdown = document.getElementById(`dropdown-${id}`);

            document.querySelectorAll('.card-menu-dropdown').forEach(d => {
                if (d !== dropdown) d.classList.remove('active');
            });

            if (dropdown) dropdown.classList.toggle('active');
            return;
        }

        if (!e.target.closest('.ui-card-more-container')) {
            document.querySelectorAll('.card-menu-dropdown').forEach(d => d.classList.remove('active'));
        }

        // Edit Address Handler
        if (e.target.classList.contains('edit-addr-btn')) {
            const id = parseInt(e.target.getAttribute('data-id'));
            const addr = addressesList.find(a => a.id === id);
            if (addr) {
                editingAddressId = id;
                addressModalTitle.textContent = 'Edit Delivery Address';
                addContactPerson.value = addr.contactPerson;
                addEmail.value = addr.email || '';
                addMobile.value = addr.mobile;

                const parts = addr.fullAddr.split(', ');
                const pincode = parts.pop() || '';
                addFullAddress.value = parts.join(', ');
                addPincode.value = pincode;

                if (['Home', 'Work'].includes(addr.tag)) {
                    addTagType.value = addr.tag;
                    addCustomTag.classList.add('hidden');
                    addCustomTag.value = '';
                } else {
                    addTagType.value = 'Other';
                    addCustomTag.classList.remove('hidden');
                    addCustomTag.value = addr.tag;
                }

                currentCoords = addr.coords ? { ...addr.coords } : null;
                if (currentCoords) {
                    locationCoordsDisplay.textContent = `Captured GPS: Lat ${currentCoords.lat}, Lng ${currentCoords.lng}`;
                } else {
                    locationCoordsDisplay.textContent = '';
                }

                newAddressModal.classList.add('active');
                initAddressMap(currentCoords ? parseFloat(currentCoords.lat) : 23.0225, currentCoords ? parseFloat(currentCoords.lng) : 72.5714);
            }
        }

        // Delete Address Handler
        if (e.target.classList.contains('delete-addr-btn')) {
            const id = parseInt(e.target.getAttribute('data-id'));
            addressesList = addressesList.filter(a => a.id !== id);
            if (selectedAddress && selectedAddress.id === id) {
                selectedAddress = null;
            }
            renderAddressCards();
            updateAllUI();
        }

        // Deliver Here Handler
        if (e.target.classList.contains('deliver-here-btn')) {
            const addrId = parseInt(e.target.getAttribute('data-id'));
            selectedAddress = addressesList.find(a => a.id === addrId);

            if (selectedAddress) {
                renderAddressCards();
                updateAllUI();
                addressSlider.classList.remove('open');
                cartSlider.classList.add('open');
                updateWhatsappVisibility();
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
            selectedAddress = null; 
            return;
        }

        let cartHTML = '';
        let subtotalPrice = 0;

        cart.forEach(item => {
            let itemTotal = item.price * item.quantity;
            subtotalPrice += itemTotal;
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
        cartSubtotalVal.textContent = subtotalPrice;

        if (selectedAddress) {
            cartSelectedAddressBox.classList.remove('hidden');
            cartAddrName.textContent = `${selectedAddress.contactPerson} (${selectedAddress.tag})`;
            cartAddrText.textContent = selectedAddress.fullAddr;

            shippingRow.classList.remove('hidden');
            totalLabelText.textContent = "Total";
            totalAmountSpan.textContent = subtotalPrice + SHIPPING_CHARGE;

            gotoDeliveryBtn.textContent = "Make Payment Now";
            gotoDeliveryBtn.style.backgroundColor = "#25D366";
        } else {
            cartSelectedAddressBox.classList.add('hidden');
            shippingRow.classList.add('hidden');
            totalLabelText.textContent = "Estimated Total";
            totalAmountSpan.textContent = subtotalPrice;

            gotoDeliveryBtn.textContent = "Select Delivery Address";
            gotoDeliveryBtn.style.backgroundColor = "#d97706";
        }

        cartTotalDiv.style.display = 'block';
    }

    cartBadge.style.display = 'none';
});