// --- DATOS DEL MENÚ VISIBLES DESDE JS ---
const menuProducts = [
    { id: 1, name: "Combo Hamburguesa", description: "Hamburguesa doble, papas y refresco", price: 120.00 },
    { id: 2, name: "Combo Pizza Personal", description: "Pizza pepperoni con bebida", price: 95.50 },
    { id: 3, name: "Combo Pollo Crispy", description: "3 tiras de pollo, puré y ensalada", price: 110.00 },
    { id: 4, name: "Combo Tacos al Pastor", description: "Orden de 5 tacos + agua fresca", price: 85.00 }
];

let cart = [];
let currentOrder = null;

// Elementos del DOM
const menuContainer = document.getElementById('menu-container');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotalPrice = document.getElementById('cart-total-price');
const btnGenerateOrder = document.getElementById('btn-generate-order');

const kitchenEmpty = document.getElementById('kitchen-empty');
const kitchenOrderDetails = document.getElementById('kitchen-order-details');
const kitchenItemsList = document.getElementById('kitchen-items-list');
const kitchenTotalPrice = document.getElementById('kitchen-total-price');
const kitchenTableId = document.getElementById('kitchen-table-id');
const orderTime = document.getElementById('order-time');

const qrModal = document.getElementById('qr-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const urlEncodedText = document.getElementById('url-encoded-text');

const btnEditOrder = document.getElementById('btn-edit-order');
const btnCompleteOrder = document.getElementById('btn-complete-order');

// Inicializar Menú en Pantalla
function renderMenu() {
    menuContainer.innerHTML = '';
    menuProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.innerHTML = `
            <div>
                <h4>${product.name}</h4>
                <p>${product.description}</p>
            </div>
            <div>
                <div class="price">$${product.price.toFixed(2)}</div>
                <button class="btn-primary" onclick="addToCart(${product.id})">Agregar</button>
            </div>
        `;
        menuContainer.appendChild(card);
    });
}

// Funciones del Carrito
function addToCart(productId) {
    const product = menuProducts.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartUI();
}

function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-text">El carrito está vacío</p>';
        btnGenerateOrder.disabled = true;
        cartCount.textContent = '0 ítems';
        cartTotalPrice.textContent = '$0.00';
        return;
    }

    let totalItems = 0;
    let totalPrice = 0;

    cart.forEach(item => {
        totalItems += item.quantity;
        totalPrice += item.price * item.quantity;

        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.name} (x${item.quantity})</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        `;
        cartItemsContainer.appendChild(li);
    });

    cartCount.textContent = `${totalItems} ítem(s)`;
    cartTotalPrice.textContent = `$${totalPrice.toFixed(2)}`;
    btnGenerateOrder.disabled = false;
}

// Generar Orden y Enviar a Cocina / QR
btnGenerateOrder.addEventListener('click', () => {
    const orderId = Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    currentOrder = {
        id: orderId,
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        time: timeString
    };

    renderKitchenOrder();
    
    // Mostrar Modal QR
    urlEncodedText.textContent = `URL Codificada: https://qr-express.local/order?id=${orderId}`;
    qrModal.classList.remove('hidden');
});

btnCloseModal.addEventListener('click', () => {
    qrModal.classList.add('hidden');
});

// Renderizar en Cocina
function renderKitchenOrder() {
    if (!currentOrder) return;

    kitchenEmpty.classList.add('hidden');
    kitchenOrderDetails.classList.remove('hidden');

    kitchenTableId.textContent = currentOrder.id;
    orderTime.textContent = currentOrder.time;
    kitchenTotalPrice.textContent = `$${currentOrder.total.toFixed(2)}`;

    kitchenItemsList.innerHTML = '';
    currentOrder.items.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${item.name} x${item.quantity}</span> <span>$${(item.price * item.quantity).toFixed(2)}</span>`;
        kitchenItemsList.appendChild(li);
    });
}

// --- FUNCIÓN DE EDITAR ORDEN DESDE COCINA ---
btnEditOrder.addEventListener('click', () => {
    if (!currentOrder) return;
    
    // Cargamos de vuelta los ítems al carrito actual para modificarlos
    cart = [...currentOrder.items];
    updateCartUI();

    // Limpiamos la vista de cocina temporalmente o indicamos edición
    alert(`Editando la orden #${currentOrder.id}. Realiza los cambios en tu carrito y vuelve a generar la orden.`);
});

// Completar Orden
btnCompleteOrder.addEventListener('click', () => {
    alert(`La orden #${currentOrder.id} ha sido marcada como completada y entregada.`);
    currentOrder = null;
    kitchenOrderDetails.classList.add('hidden');
    kitchenEmpty.classList.remove('hidden');
    cart = [];
    updateCartUI();
});

// Inicializar la aplicación al cargar
document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
});