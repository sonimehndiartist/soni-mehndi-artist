// Simple e-commerce cart management logic
document.addEventListener('DOMContentLoaded', () => {
    let cart = [];

    const cartCountSpan = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalDiv = document.getElementById('cart-total');
    const totalAmountSpan = document.getElementById('total-amount');

    // Add to cart buttons listener
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
            alert(`${name} added to your cart!`);
        });
    });

    function updateCartUI() {
        // Update total items count in top navbar
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.textContent = totalCount;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is currently empty.</p>';
            cartTotalDiv.style.display = 'none';
            return;
        }

        // Render items inside cart box
        let cartHTML = '';
        let totalPrice = 0;

        cart.forEach(item => {
            let itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;
            cartHTML += `
                <div class="cart-row">
                    <span>${item.name} (x${item.quantity})</span>
                    <span>₹${itemTotal}</span>
                </div>
            `;
        });

        cartItemsContainer.innerHTML = cartHTML;
        totalAmountSpan.textContent = totalPrice;
        cartTotalDiv.style.display = 'block';
    }
});