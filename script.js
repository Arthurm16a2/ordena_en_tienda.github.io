// 1. BASE DE DATOS LOCAL DE MENÚ/POSTRES Y CAFETERÍA
const MENU = [
    {
        id: '1',
        nombre: 'MOJADITOS',
        descripcion: 'PAN MOJADITO EN TRES LECHES CON BETÚN DE QUESO CREMA Y DIFERENTES TOPPINGS.',
        precio: 45.00,
        icono: 'fa-cake-candles',
        categoria: 'postre'
    },
    {
        id: '2',
        nombre: 'CHEESECAKE VASCO',
        descripcion: 'CREMOSO POR DENTRO, LIGERAMENTE DORADO POR FUERA.',
        precio: 65.00,
        icono: 'fa-pie-chart',
        categoria: 'otro'
    },
    {
        id: '3',
        nombre: 'GALLETAS TIPO CRUMBL',
        descripcion: 'GALLETA TIPO CRUMBL AMERICANA CON DISTINTOS TOPPINGS.',
        precio: 45.00,
        icono: 'fa-cookie-bite',
        categoria: 'postre'
    },
    {
        id: '4',
        nombre: 'AMERICANO',
        descripcion: 'CALIENTE O FRIO',
        precio: 40.00,
        icono: 'fa-mug-hot',
        categoria: 'cafe_participante'
    },
    {
        id: '5',
        nombre: 'CAPUCHINO CALIENTE',
        descripcion: 'SABORES DISPONIBLES: VAINILLA, AMARETTO, CARAMELO, AVELLANA, ETC.',
        precio: 40.00,
        icono: 'fa-mug-hot',
        categoria: 'cafe_participante'
    },
    {
        id: '6',
        nombre: 'LATTE FRÍO',
        descripcion: 'SABORES DISPONIBLES: VAINILLA, AMARETTO, CARAMELO, AVELLANA, ETC.',
        precio: 45.00,
        icono: 'fa-glass-water',
        categoria: 'cafe_participante'
    },
    {
        id: '7',
        nombre: 'MATCHA LATTE',
        descripcion: 'FRIO O CALIENTE',
        precio: 60.00,
        icono: 'fa-mug-hot',
        categoria: 'otro'
    },
    {
        id: '8',
        nombre: 'MATCHA LATTE',
        descripcion: 'FRIO O CALIENTE',
        precio: 60.00,
        icono: 'fa-glass-water',
        categoria: 'otro'
    },
    {
        id: '9',
        nombre: 'CHOCOLATE MEXICANO ARTESANAL',
        descripcion: '100% ARTESANAL CON CACAO DE TABASCO.',
        precio: 50.00,
        icono: 'fa-mug-hot',
        categoria: 'otro'
    },
    {
        id: '10',
        nombre: 'LATTES FRIOS ESPECIALES',
        descripcion: 'MANGO MATCHA, BERRIES MATCHA, MARACUYA MATCHA, ETC. (NO ENTRAN EN PROMO)',
        precio: 70.00,
        icono: 'fa-glass-water',
        categoria: 'latte_especial'
    }
];

// Estado Global
let cart = {};
let currentKitchenOrder = {}; 
let generatedURL = '';

// 2. INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
    checkURLParams(); 
});

function renderMenu() {
    const container = document.getElementById('menu-container');
    if (!container) return;
    
    container.innerHTML = MENU.map(pkg => `
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col justify-between hover:border-indigo-200 transition-all">
            <div class="flex items-start gap-3">
                <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl shrink-0">
                    <i class="fa-solid ${pkg.icono}"></i>
                </div>
                <div class="flex-grow">
                    <h3 class="font-bold text-slate-800 text-sm md:text-base">${pkg.nombre}</h3>
                    <p class="text-xs text-slate-500 mt-0.5">${pkg.descripcion}</p>
                    <span class="inline-block mt-2 font-extrabold text-indigo-600 text-base">$${pkg.precio.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="flex justify-end items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                <button onclick="updateQuantity('${pkg.id}', -1)" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-600 flex items-center justify-center transition">-</button>
                <span id="qty-${pkg.id}" class="w-8 text-center font-bold text-sm">${cart[pkg.id] || 0}</span>
                <button onclick="updateQuantity('${pkg.id}', 1)" class="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-bold text-white flex items-center justify-center transition">+</button>
            </div>
        </div>
    `).join('');
}

function updateQuantity(id, change) {
    const currentQty = cart[id] || 0;
    const newQty = Math.max(0, currentQty + change);

    if (newQty === 0) {
        delete cart[id];
    } else {
        cart[id] = newQty;
    }

    const qtyElement = document.getElementById(`qty-${id}`);
    if (qtyElement) qtyElement.innerText = newQty;

    renderCart();
}

// =========================================================================
// LÓGICA DE APLICACIÓN AUTOMÁTICA DE PROMOCIÓN ($80 COMBO)
// =========================================================================
function calcularTotalConPromocion(itemsObj) {
    let totalAcumulado = 0;
    let totalItems = 0;
    
    let cantidadPostresParticipantes = 0;
    let cantidadBebidasParticipantes = 0;
    let itemsDesglose = [];

    for (let id in itemsObj) {
        let qty = itemsObj[id];
        let prod = MENU.find(m => m.id === id);
        if (!prod) continue;

        totalItems += qty;

        for (let i = 0; i < qty; i++) {
            itemsDesglose.push({
                id: prod.id,
                nombre: prod.nombre,
                precio: prod.precio,
                categoria: prod.categoria
            });
        }
    }

    itemsDesglose.forEach(item => {
        if (item.categoria === 'postre') cantidadPostresParticipantes++;
        if (item.categoria === 'cafe_participante') cantidadBebidasParticipantes++;
    });

    let paresPromo = Math.min(cantidadPostresParticipantes, cantidadBebidasParticipantes);

    let postres = itemsDesglose.filter(i => i.categoria === 'postre').sort((a, b) => b.precio - a.precio);
    let cafes = itemsDesglose.filter(i => i.categoria === 'cafe_participante').sort((a, b) => b.precio - a.precio);
    let otros = itemsDesglose.filter(i => i.categoria !== 'postre' && i.categoria !== 'cafe_participante');

    let descripcionesPromoAplicadas = 0;

    for (let p = 0; p < paresPromo; p++) {
        totalAcumulado += 80.00;
        descripcionesPromoAplicadas++;
        postres.shift();
        cafes.shift();
    }

    postres.forEach(item => totalAcumulado += item.precio);
    cafes.forEach(item => totalAcumulado += item.precio);
    otros.forEach(item => totalAcumulado += item.precio);

    return {
        total: totalAcumulado,
        totalItems: totalItems,
        paresPromo: descripcionesPromoAplicadas
    };
}

// Renderizar el carrito del cliente aplicando la lógica automática
function renderCart() {
    const cartContainer = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    const countElement = document.getElementById('cart-count');
    const btnQR = document.getElementById('btn-generate-qr');

    const itemKeys = Object.keys(cart);

    if (itemKeys.length === 0) {
        cartContainer.innerHTML = `<p class="text-center text-slate-400 py-6 text-xs italic">El carrito está vacío</p>`;
        totalElement.innerText = '$0.00';
        countElement.innerText = '0 ítems';
        btnQR.disabled = true;
        btnQR.className = "w-full py-3 bg-slate-200 text-slate-400 font-bold rounded-xl transition flex justify-center items-center gap-2 cursor-not-allowed";
        return;
    }

    let resultadoPromo = calcularTotalConPromocion(cart);

    let htmlContenido = itemKeys.map(key => {
        const pkg = MENU.find(m => m.id === key);
        const subtotal = pkg.precio * cart[key];

        return `
            <div class="flex justify-between items-center bg-slate-50 p-2 rounded-xl text-xs">
                <div class="truncate pr-2">
                    <span class="font-bold text-slate-700 block truncate">${pkg.nombre}</span>
                    <span class="text-slate-400">${cart[key]}x $${pkg.precio.toFixed(2)}</span>
                </div>
                <span class="font-bold text-indigo-600 shrink-0">$${subtotal.toFixed(2)}</span>
            </div>
        `;
    }).join('');

    if (resultadoPromo.paresPromo > 0) {
        htmlContenido += `
            <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2 rounded-xl text-[11px] font-medium flex items-center gap-1.5 mt-2">
                <i class="fa-solid fa-tag text-emerald-600"></i>
                <span>¡Promo aplicada automáticamente! (${resultadoPromo.paresPromo} combo(s) a $80)</span>
            </div>
        `;
    }

    cartContainer.innerHTML = htmlContenido;
    totalElement.innerText = `$${resultadoPromo.total.toFixed(2)}`;
    countElement.innerText = `${resultadoPromo.totalItems} ítem${resultadoPromo.totalItems > 1 ? 's' : ''}`;

    btnQR.disabled = false;
    btnQR.className = "w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition duration-200 flex justify-center items-center gap-2 cursor-pointer";
}

// 3. GENERACIÓN DEL CÓDIGO QR
function generateQR() {
    if (Object.keys(cart).length === 0) return;

    const encodedOrder = encodeURIComponent(JSON.stringify(cart));
    const baseURL = window.location.origin + window.location.pathname;
    generatedURL = `${baseURL}?orden=${encodedOrder}`;

    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';

    new QRCode(qrContainer, {
        text: generatedURL,
        width: 180,
        height: 180,
        colorDark : "#1e1b4b",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.M
    });

    document.getElementById('qr-url-preview').innerText = generatedURL;
    document.getElementById('qr-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('qr-modal').classList.add('hidden');
}

function copyQRLink() {
    const tempInput = document.createElement('input');
    tempInput.value = generatedURL;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    alert('¡Enlace copiado al portapapeles!');
}

function simulateScan() {
    closeModal();
    switchTab('cocina');
    parseOrderData(cart);
}

// 4. RECEPCIÓN Y GESTIÓN DE LA ORDEN EN COCINA
function checkURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const ordenParam = urlParams.get('orden');

    if (ordenParam) {
        try {
            const parsedCart = JSON.parse(decodeURIComponent(ordenParam));
            document.getElementById('url-alert-banner').classList.remove('hidden');
            parseOrderData(parsedCart);
        } catch (e) {
            console.error("Error al decodificar la orden de la URL", e);
        }
    }
}

function readManualCode() {
    const inputVal = document.getElementById('manual-url-input').value.trim();
    if (!inputVal) return;

    try {
        let jsonStr = '';
        if (inputVal.includes('orden=')) {
            const url = new URL(inputVal.startsWith('http') ? inputVal : `http://${inputVal}`);
            jsonStr = url.searchParams.get('orden');
        } else {
            jsonStr = inputVal;
        }

        const parsedCart = JSON.parse(decodeURIComponent(jsonStr));
        parseOrderData(parsedCart);
        document.getElementById('manual-url-input').value = '';
    } catch (e) {
        alert('No se pudo decodificar la orden. Verifica que el código o la URL sean válidos.');
    }
}

function parseOrderData(orderObj) {
    currentKitchenOrder = {};
    MENU.forEach(pkg => {
        currentKitchenOrder[pkg.id] = orderObj[pkg.id] || 0;
    });
    
    const orderIdElement = document.getElementById('order-id');
    const timeElement = document.getElementById('order-timestamp');
    orderIdElement.innerText = Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    timeElement.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    renderKitchenOrder();
}

function renderKitchenOrder() {
    const activeItemsContainer = document.getElementById('kitchen-items-list');
    const addItemsContainer = document.getElementById('kitchen-add-items-list');
    const totalElement = document.getElementById('kitchen-total');

    activeItemsContainer.innerHTML = '';
    addItemsContainer.innerHTML = '';
    
    let activeCount = 0;
    // Ahora la cocina utiliza exactamente la misma función de cálculo de promoción automática
    let resultadoPromo = calcularTotalConPromocion(currentKitchenOrder);

    MENU.forEach(pkg => {
        const qty = currentKitchenOrder[pkg.id] || 0;

        if (qty > 0) {
            activeCount++;
            const subtotal = pkg.precio * qty;

            const itemRow = document.createElement('div');
            // SECCIÓN MEJORADA: Añadido padding horizontal (px-3) para que el texto no quede pegado a los bordes
            itemRow.className = 'flex justify-between items-center py-2.5 px-3 bg-slate-50/60 rounded-xl my-1 border border-slate-100';
            itemRow.innerHTML = `
                <div class="flex items-center gap-2 truncate pr-2">
                    <span class="font-medium text-slate-700 text-xs md:text-sm truncate">${pkg.nombre}</span>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    <div class="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                        <button onclick="updateKitchenQty('${pkg.id}', -1)" class="px-2 py-0.5 text-xs bg-slate-100 hover:bg-slate-200 font-bold text-slate-600 transition">-</button>
                        <span class="px-2 text-xs font-bold text-slate-700">${qty}</span>
                        <button onclick="updateKitchenQty('${pkg.id}', 1)" class="px-2 py-0.5 text-xs bg-indigo-50 hover:bg-indigo-100 font-bold text-indigo-600 transition">+</button>
                    </div>
                    <span class="font-semibold text-slate-800 text-xs md:text-sm w-16 text-right">$${subtotal.toFixed(2)}</span>
                </div>
            `;
            activeItemsContainer.appendChild(itemRow);
        } else {
            const addRow = document.createElement('div');
            // SECCIÓN MEJORADA: Añadido padding horizontal (px-3) para mejor estética
            addRow.className = 'flex justify-between items-center py-2 px-3 bg-slate-50 rounded-xl text-xs';
            addRow.innerHTML = `
                <span class="font-medium text-slate-600 truncate pr-2">${pkg.nombre} ($${pkg.precio.toFixed(2)})</span>
                <button onclick="updateKitchenQty('${pkg.id}', 1)" class="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-lg transition flex items-center gap-1 shrink-0">
                    <i class="fa-solid fa-plus text-[10px]"></i> Añadir
                </button>
            `;
            addItemsContainer.appendChild(addRow);
        }
    });

    if (activeCount === 0) {
        activeItemsContainer.innerHTML = `<p class="text-xs text-slate-400 italic text-center py-2">No hay productos en la orden actual.</p>`;
    }

    if (resultadoPromo.paresPromo > 0) {
        const promoNotice = document.createElement('div');
        promoNotice.className = 'bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-[11px] font-medium flex items-center gap-1.5 mt-2';
        promoNotice.innerHTML = `<i class="fa-solid fa-tag text-emerald-600"></i><span>Incluye ${resultadoPromo.paresPromo} combo(s) a $80 aplicados automáticamente.</span>`;
        activeItemsContainer.appendChild(promoNotice);
    }

    totalElement.innerText = `$${resultadoPromo.total.toFixed(2)}`;

    const statusBar = document.getElementById('status-bar');
    statusBar.className = "bg-amber-500 text-white px-4 py-2 text-xs font-bold flex justify-between items-center tracking-wider uppercase";
    statusBar.querySelector('span:first-child').innerHTML = `<i class="fa-solid fa-clock mr-1"></i> Orden Pendiente`;

    document.getElementById('btn-complete-order').disabled = false;
    document.getElementById('btn-complete-order').className = "w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition duration-200 flex justify-center items-center gap-2";

    document.getElementById('order-card-empty').classList.add('hidden');
    document.getElementById('order-card-content').classList.remove('hidden');
}

function updateKitchenQty(id, change) {
    if (currentKitchenOrder[id] === undefined) {
        currentKitchenOrder[id] = 0;
    }

    currentKitchenOrder[id] = Math.max(0, currentKitchenOrder[id] + change);
    renderKitchenOrder();
}

function markAsCompleted() {
    const statusBar = document.getElementById('status-bar');
    statusBar.className = "bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex justify-between items-center tracking-wider uppercase";
    statusBar.querySelector('span:first-child').innerHTML = `<i class="fa-solid fa-circle-check mr-1"></i> Orden Atendida / Entregada`;

    const btn = document.getElementById('btn-complete-order');
    btn.disabled = true;
    btn.className = "w-full py-3 bg-slate-200 text-slate-400 font-bold rounded-xl cursor-not-allowed flex justify-center items-center gap-2";
}

function clearKitchenOrder() {
    currentKitchenOrder = {};
    document.getElementById('order-card-empty').classList.remove('hidden');
    document.getElementById('order-card-content').classList.add('hidden');
}

// 5. NAVEGACIÓN ENTRE SECCIONES
function switchTab(tab) {
    const secCliente = document.getElementById('sec-cliente');
    const secCocina = document.getElementById('sec-cocina');
    const btnCliente = document.getElementById('nav-cliente');
    const btnCocina = document.getElementById('nav-cocina');

    if (tab === 'cliente') {
        secCliente.classList.remove('hidden');
        secCocina.classList.add('hidden');

        btnCliente.className = "px-3 py-1.5 rounded-lg bg-white text-indigo-900 font-semibold shadow transition-all flex items-center gap-1.5";
        btnCocina.className = "px-3 py-1.5 rounded-lg text-indigo-200 hover:text-white transition-all flex items-center gap-1.5";
    } else {
        secCliente.classList.add('hidden');
        secCocina.classList.remove('hidden');

        btnCocina.className = "px-3 py-1.5 rounded-lg bg-white text-indigo-900 font-semibold shadow transition-all flex items-center gap-1.5";
        btnCliente.className = "px-3 py-1.5 rounded-lg text-indigo-200 hover:text-white transition-all flex items-center gap-1.5";
    }
}