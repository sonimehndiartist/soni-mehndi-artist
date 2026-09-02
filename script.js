document.addEventListener('DOMContentLoaded', () => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let addressesList = JSON.parse(localStorage.getItem('addressesList')) || [];
    let selectedAddress = JSON.parse(localStorage.getItem('selectedAddress')) || null;
    let activeView = 'main'; // Resets view to main on normal browser refresh
    
    let editingAddressId = null; 
    const SHIPPING_CHARGE = 150;

    const floatingWhatsapp = document.getElementById('floating-whatsapp');

    function setActiveView(view) {
        activeView = view;
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

    // Original load state (clears any saved scroll/state hacks)
    sessionStorage.removeItem('scrollPosition');
    renderAddressCards();
    updateAllUI();
