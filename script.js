document.addEventListener('DOMContentLoaded', () => {
    let cart = [];
    let addressesList = []; 
    let selectedAddress = null; 
    let editingAddressId = null; 
    let pendingRedirectToAddress = false; 
    let currentCoords = null; 
    const SHIPPING_CHARGE = 150;

    // RESTORE USER SESSION FROM LOCALSTORAGE ON PAGE LOAD
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

    const floatingWhatsapp = document.getElementById('floating-whatsapp');
    const locationCoordsDisplay = document.getElementById('location-coords-display');

    // UI & Navigation elements
    const loginLink = document.getElementById('login-link');
    const loginModal = document.getElementById('login-modal');
    const closeLoginBtn = document.getElementById('close-login-btn');

    // Automatically set Navigation link if user is already logged in
    if (currentUser) {
        loginLink.textContent = currentUser.name;
    }

    function updateWhatsappVisibility() {
        const isCartOpen = cartSlider.classList.contains('open');
        const isAddressOpen = addressSlider.classList.contains('open');

        if (isCartOpen || isAddressOpen) {
            floatingWhatsapp.classList.add('hidden');
        } else {
            floatingWhatsapp.classList.remove('hidden');
        }
    }

    // Party Shots (Confetti Burst)
    function triggerPartyConfetti() {
        if (typeof confetti === 'function') {
            const count = 220;
            const defaults = { origin: { y: 0.5 } };

            function fire(particleRatio, opts) {
                confetti(Object.assign({}, defaults, opts, {
                    particleCount: Math.floor(count * particleRatio)
                }));
            }

            fire(0.25, { spread: 35, startVelocity: 60 });
            fire(0.2, { spread: 70 });
            fire(0.35, { spread: 110, decay: 0.91, scalar: 0.9 });
            fire(0.1, { spread: 130, startVelocity: 25, decay: 0.92, scalar: 1.2 });
            fire(0.1, { spread: 130, startVelocity: 50 });
        }
    }

    // --- LEAFLET MAP & GEOLOCATION LOGIC ---
    let addressMap = null;
    let mapMarker = null;

    function initAddressMap(lat = 23.0225, lng = 72.5714) {
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
                    alert('Could not fetch location. Please check browser location permissions.');
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            btn.textContent = "📍 Fetch Current Location";
            alert('Geolocation is not supported by your browser.');
        }
    });

    // --- LOGIN & REGISTER LOGIC ---
    const mobileInput = document.getElementById('mobile-input');
    const passwordInput = document.getElementById('password-input');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    const loginMessage = document.getElementById('login-message');

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

    // Payment Modal elements
    const paymentModal = document.getElementById('payment-modal');
    const paymentPaidBtn = document.getElementById('payment-paid-btn');
    const paymentCancelBtn = document.getElementById('payment-cancel-btn');

    // Order Confirm Modal elements
    const orderConfirmModal = document.getElementById('order-confirm-modal');
    const closeConfirmBtn = document.getElementById('close-confirm-btn');
    const confirmAddrPerson = document.getElementById('confirm-addr-person');
    const confirmAddrText = document.getElementById('confirm-addr-text');
    const confirmAddrContact = document.getElementById('confirm-addr-contact');
    const confirmOrderItems = document.getElementById('confirm-order-items');
    const confirmTotalVal = document.getElementById('confirm-total-val');

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

    addTagType.addEventListener('change', () => {
        if (addTagType.value === 'Other') {
            addCustomTag.classList.remove('hidden');
        } else {
            addCustomTag.classList.add('hidden');
            addCustomTag.value = '';
        }
    });

    const profileModal = document.getElementById('profile-modal');
    const closeProfileBtn = document.getElementById('close-profile-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const profileNameDisplay = document.getElementById('profile-name-display');
    const profileMobileDisplay = document.getElementById('profile-mobile-display');

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

        // SAVE USER TO LOCALSTORAGE
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

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

        // SAVE REGISTERED USER TO LOCALSTORAGE
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

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
        localStorage.removeItem('currentUser'); // CLEAR USER FROM LOCALSTORAGE
        loginLink.textContent = 'Login';
        profileModal.classList.remove('active');
        updateAllUI();
        window.location.href = '#home';
    });