const STORAGE = {
    products: 'restaurant_products_v2',
    cart: 'restaurant_cart_v2',
    invoice: 'restaurant_invoice_id',
    settings: 'restaurant_settings',
    orders: 'restaurant_orders'
};

const ADMIN_PIN = '1234';
const MAX_IMAGE_BYTES = 900 * 1024;

const CATEGORIES = [
    { id: 'all', label: 'الكل' },
    { id: 'burgers', label: 'برجر' },
    { id: 'pizza', label: 'بيتزا' },
    { id: 'chicken', label: 'دجاج' },
    { id: 'sides', label: 'جانبي' },
    { id: 'drinks', label: 'مشروبات' }
];

const defaultProducts = [
    { id: 1, title: 'برجر كلاسيك', price: 120, desc: 'لحم بقري مشوي مع الجبن والصوص الخاص.', category: 'burgers', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop' },
    { id: 2, title: 'برجر دبل تشيز', price: 155, desc: 'قطعتان من اللحم مع جبنة شيدر مضاعفة.', category: 'burgers', img: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop' },
    { id: 3, title: 'بيتزا ببروني', price: 180, desc: 'عجينة إيطالية مغطاة بقطع الببروني.', category: 'pizza', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop' },
    { id: 4, title: 'بيتزا مارجريتا', price: 140, desc: 'صلصة طماطم، موزاريلا، وريحان طازج.', category: 'pizza', img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop' },
    { id: 5, title: 'وجبة ستربس', price: 150, desc: '4 قطع دجاج مقرمش مع البطاطس والصوص.', category: 'chicken', img: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop' },
    { id: 6, title: 'دجاج مشوي', price: 165, desc: 'نصف دجاجة مشوية مع أرز وسلطة.', category: 'chicken', img: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c2?w=600&auto=format&fit=crop' },
    { id: 7, title: 'بطاطس مقلية', price: 45, desc: 'بطاطس ذهبية مقرمشة مع ملح البحر.', category: 'sides', img: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=600&auto=format&fit=crop' },
    { id: 8, title: 'عصير برتقال', price: 35, desc: 'عصير برتقال طازج بدون إضافات.', category: 'drinks', img: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop' }
];

const state = {
    products: loadJSON(STORAGE.products, defaultProducts),
    cart: loadJSON(STORAGE.cart, []),
    invoiceCounter: Number(localStorage.getItem(STORAGE.invoice)) || 1001,
    orders: loadJSON(STORAGE.orders, []),
    currentRole: 'customer',
    activeCategory: 'all',
    confirmResolver: null
};

const els = {};

document.addEventListener('DOMContentLoaded', init);

function init() {
    cacheElements();
    fillCategorySelects();
    renderCategoryFilters();
    bindEvents();
    applySettings();
    renderProducts();
    updateCartUI();
    renderOrders();
    document.getElementById('btn-customer').classList.add('active');
}

function init() {
    cacheElements();
    fillCategorySelects();
    renderCategoryFilters();
    bindEvents();
    applySettings();
    renderProducts();
    updateCartUI();
    renderOrders();
    startClock();
    document.getElementById('btn-customer').classList.add('active');
}

function startClock() {
    const clock = document.getElementById('live-clock');
    const update = () => {
        const now = new Date();
        clock.textContent = now.toLocaleTimeString('ar-EG', { hour12: true });
    };
    setInterval(update, 1000);
    update();
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('theme', target);
}

function toggleStats() {
    if (state.currentRole !== 'admin') return;
    const statsDiv = document.getElementById('admin-stats');
    statsDiv.hidden = !statsDiv.hidden;
    if (!statsDiv.hidden) {
        const revenue = state.orders.reduce((sum, o) => sum + o.total, 0);
        const count = state.orders.length;
        const avg = count > 0 ? revenue / count : 0;

        document.getElementById('stat-revenue').textContent = formatMoney(revenue);
        document.getElementById('stat-orders-count').textContent = count;
        document.getElementById('stat-avg').textContent = formatMoney(avg);
    }
}

function cacheElements() {
    [
        'welcome-modal', 'pin-modal', 'edit-modal', 'confirm-modal', 'admin-pin', 'pin-error',
        'products-grid', 'search-input', 'category-filters', 'admin-panel', 'mode-badge',
        'btn-customer', 'btn-admin', 'cart-items', 'discount-percent', 'tax-percent',
        'lock-icon-discount', 'lock-icon-tax', 'subtotal-price', 'discount-amount',
        'tax-amount', 'total-price', 'cust-name', 'cust-phone', 'toast', 'new-name',
        'new-price', 'new-desc', 'new-category', 'new-img-file', 'file-name-span',
        'edit-id', 'edit-name', 'edit-price', 'edit-desc', 'edit-category', 'edit-img-file',
        'header-cart-count', 'cart-section', 'orders-history', 'orders-list', 'confirm-title',
        'confirm-message', 'print-invoice-id', 'print-date', 'print-name', 'print-phone',
        'print-items', 'print-subtotal', 'print-discount', 'print-tax', 'print-total',
        'checkout-form'
    ].forEach((id) => {
        els[id] = document.getElementById(id);
    });
}

function bindEvents() {
    document.addEventListener('click', onClick);
    els['search-input'].addEventListener('input', debounce(renderProducts, 120));
    els['search-input'].addEventListener('search', renderProducts);
    els['search-input'].addEventListener('change', renderProducts);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    els['new-img-file'].addEventListener('change', () => previewFileName(els['new-img-file']));
    els['admin-panel'].addEventListener('submit', (e) => {
        e.preventDefault();
        addNewProduct();
    });
    els['checkout-form'].addEventListener('submit', (e) => {
        e.preventDefault();
        printReceipt();
    });
    els['discount-percent'].addEventListener('input', persistSettingsAndTotals);
    els['tax-percent'].addEventListener('input', persistSettingsAndTotals);
    els['admin-pin'].addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submitPin();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeOpenModals();
    });
}

function onClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = Number(btn.dataset.id);
    const delta = Number(btn.dataset.delta);

    const actions = {
        'enter-customer': () => selectInitialRole('customer'),
        'enter-admin': () => selectInitialRole('admin'),
        'role-customer': () => switchRole('customer'),
        'role-admin': () => openPinModal(),
        'submit-pin': submitPin,
        'close-pin': closePinModal,
        'save-edit': saveEditedProduct,
        'close-edit': closeEditModal,
        'confirm-ok': () => resolveConfirm(true),
        'confirm-cancel': () => resolveConfirm(false),
        'toggle-cart': toggleCart,
        'clear-cart': clearCart,
        'reset-menu': resetMenu,
        'toggle-history': toggleHistory,
        'add-to-cart': () => addToCart(id),
        'edit-product': () => openEditModal(id),
        'delete-product': () => deleteProduct(id),
        'toggle-stats': toggleStats,
        'qty': () => changeQuantity(id, delta),
        'filter-category': () => setCategory(btn.dataset.category)
    };

    if (actions[action]) actions[action]();
}

function selectInitialRole(role) {
    els['welcome-modal'].classList.add('hidden');
    if (role === 'admin') openPinModal();
    else switchRole('customer');
}

function openPinModal() {
    els['pin-error'].hidden = true;
    els['admin-pin'].value = '';
    els['pin-modal'].classList.remove('hidden');
    els['admin-pin'].focus();
}

function closePinModal() {
    els['pin-modal'].classList.add('hidden');
}

function submitPin() {
    const pin = els['admin-pin'].value.trim();
    if (pin === ADMIN_PIN) {
        closePinModal();
        switchRole('admin', true);
    } else {
        els['pin-error'].hidden = false;
        els['admin-pin'].select();
    }
}

function switchRole(role, authenticated = false) {
    if (role === 'admin' && !authenticated && state.currentRole !== 'admin') {
        openPinModal();
        return;
    }

    state.currentRole = role;
    const isAdmin = role === 'admin';
    els['btn-admin'].classList.toggle('active', isAdmin);
    els['btn-customer'].classList.toggle('active', !isAdmin);
    els['admin-panel'].hidden = !isAdmin;
    els['admin-panel'].classList.toggle('admin-only', !isAdmin);
    els['mode-badge'].textContent = isAdmin ? 'وضع المدير' : 'وضع العميل';
    els['discount-percent'].toggleAttribute('readonly', !isAdmin);
    els['tax-percent'].toggleAttribute('readonly', !isAdmin);
    els['lock-icon-discount'].style.display = isAdmin ? 'none' : 'inline';
    els['lock-icon-tax'].style.display = isAdmin ? 'none' : 'inline';
    if (!isAdmin) els['orders-history'].hidden = true;
    renderProducts();
    if (isAdmin) showToast('تم تسجيل الدخول كمدير');
}

function fillCategorySelects() {
    const options = CATEGORIES.filter((c) => c.id !== 'all')
        .map((c) => `<option value="${c.id}">${c.label}</option>`)
        .join('');
    els['new-category'].innerHTML = options;
    els['edit-category'].innerHTML = options;
}

function renderCategoryFilters() {
    els['category-filters'].innerHTML = CATEGORIES.map((cat) => `
        <button type="button" class="chip${cat.id === state.activeCategory ? ' active' : ''}"
            data-action="filter-category" data-category="${cat.id}" role="tab"
            aria-selected="${cat.id === state.activeCategory}">${cat.label}</button>
    `).join('');
}

function setCategory(category) {
    state.activeCategory = category;
    renderCategoryFilters();
    renderProducts();
}

function getVisibleProducts() {
    const query = els['search-input'].value.trim().toLowerCase();
    return state.products.filter((p) => {
        const inCategory = state.activeCategory === 'all' || p.category === state.activeCategory;
        const inSearch = !query || p.title.toLowerCase().includes(query) || (p.desc || '').toLowerCase().includes(query);
        return inCategory && inSearch;
    });
}

function renderProducts() {
    const items = getVisibleProducts();
    if (!items.length) {
        els['products-grid'].innerHTML = '<p class="empty-state">لا توجد وجبات مطابقة للبحث حالياً.</p>';
        return;
    }

    els['products-grid'].innerHTML = items.map((product) => {
        const cat = CATEGORIES.find((c) => c.id === product.category);
        const adminBtns = state.currentRole === 'admin' ? `
            <div class="card-actions">
                <button type="button" class="action-btn edit-btn" data-action="edit-product" data-id="${product.id}" aria-label="تعديل ${escapeAttr(product.title)}">✎</button>
                <button type="button" class="action-btn delete-btn" data-action="delete-product" data-id="${product.id}" aria-label="حذف ${escapeAttr(product.title)}">✕</button>
            </div>` : '';

        return `
            <article class="card">
                <div class="card-img-wrapper">
                    <img src="${escapeAttr(product.img || placeholderImg())}" alt="${escapeAttr(product.title)}" loading="lazy">
                    <span class="card-cat">${cat ? cat.label : 'عام'}</span>
                    <span class="price-tag">${formatMoney(product.price)}</span>
                    ${adminBtns}
                </div>
                <div class="card-body">
                    <h3>${escapeHtml(product.title)}</h3>
                    <p class="description">${escapeHtml(product.desc || '')}</p>
                    <button type="button" class="add-to-cart-btn" data-action="add-to-cart" data-id="${product.id}">إضافة للسلة</button>
                </div>
            </article>`;
    }).join('');
}

async function addNewProduct() {
    if (state.currentRole !== 'admin') return;
    const name = els['new-name'].value.trim();
    const price = Number(els['new-price'].value);
    const desc = els['new-desc'].value.trim();
    const category = els['new-category'].value;
    const file = els['new-img-file'].files[0];

    if (!name || !Number.isFinite(price) || price <= 0) {
        showToast('أدخل اسماً وسعراً صحيحين');
        return;
    }

    let img = placeholderImg();
    try {
        if (file) img = await readImage(file);
    } catch (err) {
        showToast(err.message);
        return;
    }

    state.products.push({
        id: Date.now(),
        title: name,
        price,
        desc: desc || 'وجبة شهية ولذيذة',
        category,
        img
    });
    persistProducts();
    els['admin-panel'].reset();
    els['file-name-span'].textContent = 'لم يتم اختيار ملف';
    renderProducts();
    showToast('تمت إضافة الوجبة للمنيو');
}

function openEditModal(id) {
    if (state.currentRole !== 'admin') return;
    const prod = state.products.find((p) => p.id === id);
    if (!prod) return;
    els['edit-id'].value = String(prod.id);
    els['edit-name'].value = prod.title;
    els['edit-price'].value = String(prod.price);
    els['edit-desc'].value = prod.desc || '';
    els['edit-category'].value = prod.category || 'burgers';
    els['edit-img-file'].value = '';
    els['edit-modal'].classList.remove('hidden');
    els['edit-name'].focus();
}

function closeEditModal() {
    els['edit-modal'].classList.add('hidden');
}

async function saveEditedProduct() {
    if (state.currentRole !== 'admin') return;
    const id = Number(els['edit-id'].value);
    const name = els['edit-name'].value.trim();
    const price = Number(els['edit-price'].value);
    const desc = els['edit-desc'].value.trim();
    const category = els['edit-category'].value;
    const file = els['edit-img-file'].files[0];
    const index = state.products.findIndex((p) => p.id === id);
    if (index === -1) return;
    if (!name || !Number.isFinite(price) || price <= 0) {
        showToast('بيانات الوجبة غير مكتملة');
        return;
    }

    try {
        if (file) state.products[index].img = await readImage(file);
    } catch (err) {
        showToast(err.message);
        return;
    }

    Object.assign(state.products[index], { title: name, price, desc, category });
    persistProducts();
    closeEditModal();
    renderProducts();
    showToast('تم تعديل الوجبة بنجاح');
}

async function deleteProduct(id) {
    if (state.currentRole !== 'admin') return;
    const ok = await askConfirm('حذف الوجبة', 'هل تريد حذف هذه الوجبة نهائياً؟');
    if (!ok) return;
    state.products = state.products.filter((p) => p.id !== id);
    persistProducts();
    renderProducts();
    showToast('تم حذف الوجبة');
}

async function resetMenu() {
    if (state.currentRole !== 'admin') return;
    const ok = await askConfirm('استعادة المنيو', 'سيتم استبدال المنيو الحالي بالقائمة الافتراضية.');
    if (!ok) return;
    state.products = defaultProducts.map((p) => ({ ...p }));
    persistProducts();
    renderProducts();
    showToast('تمت استعادة المنيو الافتراضي');
}

function addToCart(id) {
    const product = state.products.find((p) => p.id === id);
    if (!product) return;
    const existing = state.cart.find((item) => item.id === id);
    if (existing) existing.quantity += 1;
    else state.cart.push({ id, title: product.title, price: product.price, quantity: 1 });
    persistCart();
    updateCartUI();
    showToast(`أضيفت «${product.title}» للسلة`);
}

function changeQuantity(id, delta) {
    const item = state.cart.find((x) => x.id === id);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) state.cart = state.cart.filter((x) => x.id !== id);
    persistCart();
    updateCartUI();
}

async function clearCart() {
    if (!state.cart.length) return;
    const ok = await askConfirm('تفريغ السلة', 'هل ترغب بمسح كل الأصناف من السلة؟');
    if (!ok) return;
    state.cart = [];
    persistCart();
    updateCartUI();
}

function calcTotals() {
    const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountPercent = clamp(Number(els['discount-percent'].value) || 0, 0, 100);
    const taxPercent = clamp(Number(els['tax-percent'].value) || 0, 0, 50);
    const discountAmount = (subtotal * discountPercent) / 100;
    const taxed = subtotal - discountAmount;
    const taxAmount = (taxed * taxPercent) / 100;
    return { subtotal, discountAmount, taxAmount, finalTotal: taxed + taxAmount, discountPercent, taxPercent };
}

function updateCartUI() {
    const count = state.cart.reduce((n, i) => n + i.quantity, 0);
    els['header-cart-count'].textContent = String(count);

    if (!state.cart.length) {
        els['cart-items'].innerHTML = '<li class="empty-msg">السلة فارغة حالياً</li>';
    } else {
        els['cart-items'].innerHTML = state.cart.map((item) => `
            <li>
                <div class="cart-item-meta">
                    <strong>${escapeHtml(item.title)}</strong>
                    <span>${formatMoney(item.price)} × ${item.quantity}</span>
                </div>
                <div class="qty-wrap">
                    <button type="button" class="qty-btn" data-action="qty" data-id="${item.id}" data-delta="-1" aria-label="إنقاص">−</button>
                    <span>${item.quantity}</span>
                    <button type="button" class="qty-btn" data-action="qty" data-id="${item.id}" data-delta="1" aria-label="زيادة">+</button>
                </div>
            </li>`).join('');
    }

    const totals = calcTotals();
    els['subtotal-price'].textContent = formatMoney(totals.subtotal);
    els['discount-amount'].textContent = formatMoney(totals.discountAmount);
    els['tax-amount'].textContent = formatMoney(totals.taxAmount);
    els['total-price'].textContent = formatMoney(totals.finalTotal);
}

function persistSettingsAndTotals() {
    if (state.currentRole !== 'admin') {
        applySettings();
        updateCartUI();
        return;
    }
    localStorage.setItem(STORAGE.settings, JSON.stringify({
        discount: els['discount-percent'].value,
        tax: els['tax-percent'].value
    }));
    updateCartUI();
}

function applySettings() {
    const settings = loadJSON(STORAGE.settings, { discount: '0', tax: '14' });
    els['discount-percent'].value = settings.discount;
    els['tax-percent'].value = settings.tax;
}

function printReceipt() {
    const nameInput = els['cust-name'].value.trim();
    const phoneInput = els['cust-phone'].value.trim();

    if (!state.cart.length) {
        showToast('السلة فارغة');
        return;
    }
    if (!nameInput) {
        showToast('أدخل اسم العميل أولاً');
        els['cust-name'].focus();
        return;
    }
    if (phoneInput && !/^01\d{9}$/.test(phoneInput.replace(/\s+/g, ''))) {
        showToast('رقم الهاتف غير صالح');
        els['cust-phone'].focus();
        return;
    }

    const totals = calcTotals();
    const now = new Date();
    els['print-invoice-id'].textContent = String(state.invoiceCounter);
    els['print-date'].textContent = now.toLocaleString('ar-EG');
    els['print-name'].textContent = nameInput;
    els['print-phone'].textContent = phoneInput || 'غير مدخل';
    els['print-items'].innerHTML = state.cart.map((item) =>
        `<tr><td>${escapeHtml(item.title)}</td><td>${item.quantity}</td><td>${formatMoney(item.price * item.quantity)}</td></tr>`
    ).join('');
    els['print-subtotal'].textContent = totals.subtotal.toFixed(2);
    els['print-discount'].textContent = totals.discountAmount.toFixed(2);
    els['print-tax'].textContent = totals.taxAmount.toFixed(2);
    els['print-total'].textContent = totals.finalTotal.toFixed(2);

    state.orders.unshift({
        id: state.invoiceCounter,
        name: nameInput,
        total: totals.finalTotal,
        date: now.toISOString()
    });
    state.orders = state.orders.slice(0, 20);
    localStorage.setItem(STORAGE.orders, JSON.stringify(state.orders));
    state.invoiceCounter += 1;
    localStorage.setItem(STORAGE.invoice, String(state.invoiceCounter));
    renderOrders();

    window.print();
    state.cart = [];
    persistCart();
    updateCartUI();
    els['cust-name'].value = '';
    els['cust-phone'].value = '';
    showToast('تم إصدار الفاتورة');
}

function renderOrders() {
    if (!state.orders.length) {
        els['orders-list'].innerHTML = '<li>لا توجد فواتير محفوظة بعد.</li>';
        return;
    }
    els['orders-list'].innerHTML = state.orders.map((o) => `
        <li>
            <span>#${o.id} — ${escapeHtml(o.name)}</span>
            <strong>${formatMoney(o.total)}</strong>
        </li>`).join('');
}

function toggleHistory() {
    if (state.currentRole !== 'admin') return;
    els['orders-history'].hidden = !els['orders-history'].hidden;
    renderOrders();
}

function toggleCart() {
    els['cart-section'].classList.toggle('open');
}

function previewFileName(input) {
    els['file-name-span'].textContent = input.files?.[0]?.name || 'لم يتم اختيار ملف';
}

function readImage(file) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            reject(new Error('الملف المختار ليس صورة'));
            return;
        }
        if (file.size > MAX_IMAGE_BYTES) {
            reject(new Error('حجم الصورة أكبر من 900 كيلوبايت'));
            return;
        }
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('تعذر قراءة الصورة'));
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}

function askConfirm(title, message) {
    els['confirm-title'].textContent = title;
    els['confirm-message'].textContent = message;
    els['confirm-modal'].classList.remove('hidden');
    return new Promise((resolve) => {
        state.confirmResolver = resolve;
    });
}

function resolveConfirm(value) {
    els['confirm-modal'].classList.add('hidden');
    if (state.confirmResolver) state.confirmResolver(value);
    state.confirmResolver = null;
}

function closeOpenModals() {
    ['pin-modal', 'edit-modal', 'confirm-modal'].forEach((id) => els[id].classList.add('hidden'));
    if (state.confirmResolver) resolveConfirm(false);
}

function persistProducts() {
    localStorage.setItem(STORAGE.products, JSON.stringify(state.products));
}

function persistCart() {
    localStorage.setItem(STORAGE.cart, JSON.stringify(state.cart));
}

function loadJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function formatMoney(value) {
    return `${Number(value).toFixed(2)} ج.م`;
}

function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
}

function placeholderImg() {
    return 'data:image/svg+xml,' + encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#eadfce"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="28" fill="#7a6d62" font-family="Cairo,sans-serif">وجبة</text></svg>`
    );
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeAttr(str) {
    return escapeHtml(str);
}

function debounce(fn, wait) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
    };
}

let toastTimer;
function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2200);
}
