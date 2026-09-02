document.addEventListener('DOMContentLoaded', () => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let addressesList = JSON.parse(localStorage.getItem('addressesList')) || [];
    let selectedAddress = JSON.parse(localStorage.getItem('selectedAddress')) || null;
    let activeView = localStorage.getItem('activeView') || 'main';
    
    let editingAddressId = null; 
    const SHIPPING_CHARGE = 150;

    const floatingWhatsapp = document.getElementById('floating-whatsapp');

    function setActiveView(view) {
        activeView = view;
        localStorage.setItem('activeView', view);
        updateWhatsappVisibility();
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

    // Party Shots (Confetti Burst directly above Modal)
    function triggerPartyConfetti() {
        if (typeof confetti === 'function') {
            const count = 220;
            const defaults = { 
                origin: { y: 0.5 },
                zIndex: 9999 
            };

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

    // Helper function to capitalize the first letter of every word after a space
    function capitalizeWords(str) {
        return str.replace(/\b\w/g, function(match) {
            return match.toUpperCase();
        });
    }

    // Helper function to format date as DD/MM/YYYY hh:mm:ss
    function getFormattedDateTime() {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }

    // SAVE SCROLL POSITION BEFORE REFRESH
    window.addEventListener('beforeunload', () => {
        sessionStorage.setItem('scrollPosition', window.scrollY);
    });

    // RESTORE PREVIOUS TAB AND SCROLL POSITION ON REFRESH
    function restoreViewState() {
        renderAddressCards();
        updateAllUI();

        if (activeView === 'cart' && cart.length > 0) {
            cartSlider.classList.add('open');
            cartOverlay.classList.add('active');
        } else if (activeView === 'address') {
            addressSlider.classList.add('open');
            cartOverlay.classList.add('active');
        } else if (activeView === 'summary') {
            orderConfirmModal.classList.add('active');
        }
        updateWhatsappVisibility();

        const savedScroll = sessionStorage.getItem('scrollPosition');
        if (savedScroll) {
            window.scrollTo(0, parseInt(savedScroll));
            sessionStorage.removeItem('scrollPosition');
        }
    }

    // Modal & UI Elements
    const orderConfirmModal = document.getElementById('order-confirm-modal');
    const closeConfirmBtn = document.getElementById('close-confirm-btn');
    const confirmOrderIdDisplay = document.getElementById('confirm-order-id-display');
    const confirmAddrPerson = document.getElementById('confirm-addr-person');
    const confirmAddrText = document.getElementById('confirm-addr-text');
    const confirmAddrContact = document.getElementById('confirm-addr-contact');
    const confirmOrderItems = document.getElementById('confirm-order-items');
    const confirmTotalVal = document.getElementById('confirm-total-val');

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

    const cartSelectedAddressBox = document.getElementById('cart-selected-address-box');
    const cartAddrName = document.getElementById('cart-addr-name');
    const cartAddrText = document.getElementById('cart-addr-text');
    const changeAddressBtn = document.getElementById('change-address-btn');
    const shippingRow = document.getElementById('shipping-row');
    const cartSubtotalVal = document.getElementById('cart-subtotal-val');
    const totalLabelText = document.getElementById('total-label-text');

    triggerAddAddressBtn.addEventListener('click', () => {
        editingAddressId = null;
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
    });

    closeNewAddressBtn.addEventListener('click', () => {
        newAddressModal.classList.remove('active');
    });

    saveAddressBtn.addEventListener('click', () => {
        let contactPerson = addContactPerson.value.trim();
        let email = addEmail.value.trim();
        let mobile = addMobile.value.trim();
        let fullAddr = addFullAddress.value.trim();
        let pincode = addPincode.value.trim();
        
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

        // 1. Mobile Number must be exactly 10 digits
        const mobileRegex = /^\d{10}$/;
        if (!mobileRegex.test(mobile)) {
            addressFormMsg.style.color = '#c91818';
            addressFormMsg.textContent = 'Mobile number must be exactly 10 digits.';
            return;
        }

        // 2. Email validation (if provided)
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                addressFormMsg.style.color = '#c91818';
                addressFormMsg.textContent = 'Please enter a valid email address.';
                return;
            }
        }

        // 3. PIN Code must be numbers only
        const pincodeRegex = /^\d+$/;
        if (!pincodeRegex.test(pincode)) {
            addressFormMsg.style.color = '#c91818';
            addressFormMsg.textContent = 'PIN code must contain numbers only.';
            return;
        }

        // 4. Capitalize first letter of every word in full name
        contactPerson = capitalizeWords(contactPerson);

        // 5. Capitalize first letter of every word in full address
        fullAddr = capitalizeWords(fullAddr);

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
                    tag
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
                tag
            };
            addressesList.push(newAddressObj);
        }

        localStorage.setItem('addressesList', JSON.stringify(addressesList));
        if (selectedAddress) {
            localStorage.setItem('selectedAddress', JSON.stringify(selectedAddress));
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
                    <button class="deliver-here-btn" data-id="${addr.id}">Deliver Here</button>
                </div>
            `;
        });

        addressCardsList.innerHTML = html;
    }

    // DISPATCH ORDER DETAILS SECURELY TO GMAIL VIA FORMSUBMIT
    async function sendOrderEmail(orderData) {
        const cleanItemList = orderData.items
            .map(item => `${item.name} (${item.unit}) x ${item.quantity} [₹${item.price * item.quantity}]`)
            .join(', ');

        const payload = {
            _subject: `New Order ${orderData.orderId} - Soni Mehndi Artist`,
            _template: "table",
            _captcha: "false",
            "Order ID": orderData.orderId,
            "Customer Name": orderData.address.contactPerson,
            "Mobile Number": orderData.address.mobile,
            "Email Address": orderData.address.email || "Not provided",
            "Address": orderData.address.fullAddr,
            "Address Type": orderData.address.tag,
            "Ordered Items": cleanItemList,
            "Delivery Charges": `₹${SHIPPING_CHARGE}`,
            "Total Amount": `₹${orderData.total}`,
            "Order Date": getFormattedDateTime()
        };

        try {
            await fetch("https://formsubmit.co/ajax/sonimehndiartist@gmail.com", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(payload)
            });
        } catch (err) {
            console.error("Email dispatch failed:", err);
        }
    }

    // PLACE DIRECT ORDER & SYNC ALL DETAILS VIA SHEETDB
    async function placeDirectOrder() {
        if (!selectedAddress || cart.length === 0) return;

        gotoDeliveryBtn.disabled = true;
        gotoDeliveryBtn.textContent = "Placing Order...";

        let subtotal = 0;
        let itemsText = '';
        let itemsHtml = '';

        cart.forEach(item => {
            let itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            itemsHtml += `
                <div style="display:flex; justify-content:space-between; margin-bottom: 6px; font-size: 0.9rem;">
                    <span>${item.name} (${item.unit}) x ${item.quantity}</span>
                    <span style="font-weight:bold;">₹${itemTotal}</span>
                </div>
            `;
            itemsText += `${item.name} (${item.unit}) x ${item.quantity}, `;
        });

        itemsHtml += `
            <div style="display:flex; justify-content:space-between; font-size: 0.85rem; color: #666; margin-top: 4px;">
                <span>Shipping Charges:</span>
                <span>₹${SHIPPING_CHARGE}</span>
            </div>
        `;

        const finalVal = subtotal + SHIPPING_CHARGE;
        const formattedDateTimeStr = getFormattedDateTime();

        // Fetch & Increment Global Order ID from SheetDB
        let currentOrderIdNum = 4000001;
        const sheetDbUrl = "https://sheetdb.io/api/v1/63vq1gt4gop10";

        try {
            const getRes = await fetch(sheetDbUrl);
            const rows = await getRes.json();

            if (Array.isArray(rows) && rows.length > 0) {
                let maxId = 4000000;
                rows.forEach(row => {
                    let idVal = parseInt(String(row.OrderId || "").replace("#", ""));
                    if (!isNaN(idVal) && idVal > maxId) {
                        maxId = idVal;
                    }
                });
                currentOrderIdNum = maxId + 1;
            }

            await fetch(sheetDbUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    data: {
                        OrderId: currentOrderIdNum,
                        CustomerName: selectedAddress.contactPerson,
                        Mobile: selectedAddress.mobile,
                        Email: selectedAddress.email || "Not provided",
                        Address: selectedAddress.fullAddr,
                        AddressType: selectedAddress.tag,
                        OrderedItems: itemsText,
                        DeliveryCharges: "₹" + SHIPPING_CHARGE,
                        Total: "₹" + finalVal,
                        Date: formattedDateTimeStr
                    }
                })
            });
        } catch (err) {
            console.error("SheetDB global sync error, using fallback:", err);
            currentOrderIdNum = parseInt(localStorage.getItem('lastOrderId')) || 4000001;
            localStorage.setItem('lastOrderId', currentOrderIdNum + 1);
        }

        const generatedOrderId = '#' + currentOrderIdNum;

        const orderData = {
            orderId: generatedOrderId,
            address: selectedAddress,
            items: cart,
            total: finalVal
        };

        // Send email backup
        sendOrderEmail(orderData);

        gotoDeliveryBtn.disabled = false;
        gotoDeliveryBtn.textContent = "Place Order";
        closeAllSliders();

        confirmOrderIdDisplay.textContent = `Order ID: ${generatedOrderId}`;
        confirmAddrPerson.textContent = `${selectedAddress.contactPerson} (${selectedAddress.tag})`;
        confirmAddrText.textContent = selectedAddress.fullAddr;
        confirmAddrContact.textContent = `Mobile: ${selectedAddress.mobile}${selectedAddress.email ? ' | Email: ' + selectedAddress.email : ''}`;
        confirmOrderItems.innerHTML = itemsHtml;
        confirmTotalVal.textContent = finalVal;

        orderConfirmModal.classList.add('active');
        setActiveView('summary');

        setTimeout(() => {
            triggerPartyConfetti();
        }, 100);
    }

    closeConfirmBtn.addEventListener('click', () => {
        orderConfirmModal.classList.remove('active');
        cart = []; 
        selectedAddress = null; 
        localStorage.removeItem('selectedAddress');
        setActiveView('main');
        updateAllUI(); 
    });

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
        setActiveView('cart');
    });

    function closeAllSliders() {
        cartSlider.classList.remove('open');
        addressSlider.classList.remove('open');
        cartOverlay.classList.remove('active');
        setActiveView('main');
    }

    closeCartBtn.addEventListener('click', closeAllSliders);
    closeAddressBtn.addEventListener('click', closeAllSliders);
    cartOverlay.addEventListener('click', closeAllSliders);

    gotoDeliveryBtn.addEventListener('click', () => {
        if (selectedAddress && gotoDeliveryBtn.textContent === "Place Order") {
            placeDirectOrder();
            return;
        }

        cartSlider.classList.remove('open');
        addressSlider.classList.add('open');
        setActiveView('address');
    });

    changeAddressBtn.addEventListener('click', () => {
        cartSlider.classList.remove('open');
        addressSlider.classList.add('open');
        setActiveView('address');
    });

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

                newAddressModal.classList.add('active');
            }
        }

        if (e.target.classList.contains('delete-addr-btn')) {
            const id = parseInt(e.target.getAttribute('data-id'));
            addressesList = addressesList.filter(a => a.id !== id);
            
            if (selectedAddress && selectedAddress.id === id) {
                selectedAddress = null;
                localStorage.removeItem('selectedAddress');
            }

            localStorage.setItem('addressesList', JSON.stringify(addressesList));
            renderAddressCards();
            updateAllUI();
        }

        if (e.target.classList.contains('deliver-here-btn')) {
            const addrId = parseInt(e.target.getAttribute('data-id'));
            selectedAddress = addressesList.find(a => a.id === addrId);

            if (selectedAddress) {
                localStorage.setItem('selectedAddress', JSON.stringify(selectedAddress));
                renderAddressCards();
                updateAllUI();
                addressSlider.classList.remove('open');
                cartSlider.classList.add('open');
                setActiveView('cart');
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
        localStorage.setItem('cart', JSON.stringify(cart));
        if (selectedAddress) {
            localStorage.setItem('selectedAddress', JSON.stringify(selectedAddress));
        }

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
            localStorage.removeItem('selectedAddress');
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

            gotoDeliveryBtn.textContent = "Place Order";
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

    restoreViewState();
});
