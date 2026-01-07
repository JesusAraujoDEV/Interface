// Toggle Delivery / Pickup
const deliveryBtn = document.getElementById('deliveryBtn');
const pickupBtn = document.getElementById('pickupBtn');
const deliveryCoverageBlock = document.getElementById('deliveryCoverageBlock');
const coverage = document.getElementById('coverage');

// Zonas de cobertura (solo entrega)
const zoneInput = document.getElementById('zone');
const zoneChips = document.querySelectorAll('.zone-chip');

// Carrito (solo visualización en checkout)
const CART_KEY = 'dp_cart_v1';

function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : { items: [] };
  } catch {
    return { items: [] };
  }
}

function parsePrice(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const raw = String(value ?? '').trim();
  if (!raw) return 0;
  const cleaned = raw.replace(/[^0-9,.-]/g, '');
  if (!cleaned) return 0;
  let normalized = cleaned;
  const hasComma = normalized.includes(',');
  const hasDot = normalized.includes('.');
  if (hasComma && hasDot) normalized = normalized.replace(/\./g, '').replace(',', '.');
  else if (hasComma && !hasDot) normalized = normalized.replace(',', '.');
  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
}

function formatPrice(value) {
  const num = parsePrice(value);
  return '$' + num.toFixed(2);
}

function cartTotal(cart) {
  return (cart.items || []).reduce((acc, it) => acc + parsePrice(it.price) * (it.qty || 0), 0);
}

function renderCartModal() {
  const itemsEl = document.getElementById('cartModalItems');
  const totalEl = document.getElementById('cartModalTotal');
  if (!itemsEl || !totalEl) return;

  const cart = readCart();
  const items = cart.items || [];
  totalEl.textContent = formatPrice(cartTotal(cart));

  if (!items.length) {
    itemsEl.innerHTML = '<div class="py-4 text-sm text-gray-600">Tu carrito está vacío.</div>';
    return;
  }

  itemsEl.innerHTML = items
    .map(it => {
      const qty = it.qty || 0;
      const lineTotal = parsePrice(it.price) * qty;
      return `
        <div class="py-4 flex items-start justify-between gap-4">
          <div class="min-w-0">
            <div class="font-semibold text-gray-900 truncate">${it.name ?? 'Producto'}</div>
            <div class="text-sm text-gray-600 mt-0.5">${formatPrice(it.price)} · x${qty}</div>
          </div>
          <div class="shrink-0 text-sm font-extrabold text-gray-900">${formatPrice(lineTotal)}</div>
        </div>
      `;
    })
    .join('');
}

function openCartModal() {
  const modal = document.getElementById('cartModal');
  if (!modal) return;
  renderCartModal();
  modal.classList.remove('hidden');
}

function closeCartModal() {
  const modal = document.getElementById('cartModal');
  if (!modal) return;
  modal.classList.add('hidden');
}

document.getElementById('viewCartBtn')?.addEventListener('click', openCartModal);
document.getElementById('cartModalOverlay')?.addEventListener('click', closeCartModal);
document.getElementById('cartModalClose')?.addEventListener('click', closeCartModal);

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const modal = document.getElementById('cartModal');
  if (modal && !modal.classList.contains('hidden')) closeCartModal();
});
function setZone(zone) {
  zoneInput.value = zone;
  zoneChips.forEach(btn => {
    const isActive = btn.dataset.zone === zone;
    btn.classList.toggle('bg-brand-800', isActive);
    btn.classList.toggle('text-white', isActive);
    btn.classList.toggle('border-brand-800', isActive);
    btn.classList.toggle('bg-white', !isActive);
    btn.classList.toggle('text-gray-700', !isActive);
    btn.classList.toggle('border-gray-200', !isActive);
  });
}

zoneChips.forEach(btn => {
  btn.addEventListener('click', () => setZone(btn.dataset.zone));
});

function setMode(mode) {
  if (mode === 'delivery') {
    deliveryBtn.classList.remove('bg-gray-100', 'text-gray-700');
    deliveryBtn.classList.add('bg-brand-800', 'text-white');
    deliveryBtn.setAttribute('aria-pressed', 'true');

    pickupBtn.classList.remove('bg-brand-800', 'text-white');
    pickupBtn.classList.add('bg-gray-100', 'text-gray-700');
    pickupBtn.setAttribute('aria-pressed', 'false');

    deliveryCoverageBlock.classList.remove('hidden');
    coverage.textContent = 'Selecciona una zona para validar cobertura';
  } else {
    pickupBtn.classList.remove('bg-gray-100', 'text-gray-700');
    pickupBtn.classList.add('bg-brand-800', 'text-white');
    pickupBtn.setAttribute('aria-pressed', 'true');

    deliveryBtn.classList.remove('bg-brand-800', 'text-white');
    deliveryBtn.classList.add('bg-gray-100', 'text-gray-700');
    deliveryBtn.setAttribute('aria-pressed', 'false');

    // Para recogida, ocultar dirección y actualizar mensaje
    deliveryCoverageBlock.classList.add('hidden');
    coverage.textContent = 'Recogida — no requiere envío';
  }
}

deliveryBtn.addEventListener('click', () => setMode('delivery'));
pickupBtn.addEventListener('click', () => setMode('pickup'));

// Initialize default
setMode('delivery');

// Selección por defecto (puedes cambiarla o quitarla)
setZone('Prebo');

// Basic validation
const form = document.getElementById('checkoutForm');
const errName = document.getElementById('err-name');
const errPhone = document.getElementById('err-phone');
const errEmail = document.getElementById('err-email');
const errAddress = document.getElementById('err-address');
const errZone = document.getElementById('err-zone');

function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

form.addEventListener('submit', function (e) {
  e.preventDefault();
  let valid = true;

  const nameVal = document.getElementById('fullName').value.trim();
  const phoneVal = document.getElementById('phone').value.trim();
  const emailVal = document.getElementById('email').value.trim();
  const addressVal = document.getElementById('addressDetail')
    ? document.getElementById('addressDetail').value.trim()
    : '';
  const zoneVal = zoneInput ? zoneInput.value.trim() : '';

  // Reset errors
  [errName, errPhone, errEmail, errAddress, errZone].forEach(el => el.classList.add('hidden'));

  if (!nameVal) {
    errName.classList.remove('hidden');
    valid = false;
  }
  if (!phoneVal) {
    errPhone.classList.remove('hidden');
    valid = false;
  }
  if (!emailVal || !validateEmail(emailVal)) {
    errEmail.classList.remove('hidden');
    valid = false;
  }

  // Address required only for delivery
  if (deliveryBtn.getAttribute('aria-pressed') === 'true') {
    if (!zoneVal) {
      errZone.classList.remove('hidden');
      valid = false;
    }
    if (!addressVal) {
      errAddress.classList.remove('hidden');
      valid = false;
    }
  }

  if (valid) {
    // Navegar a la siguiente vista (lista de pedidos)
    const mode = deliveryBtn.getAttribute('aria-pressed') === 'true' ? 'delivery' : 'pickup';
    const nextUrl = new URL('../order-tracking/index.html', window.location.href);
    nextUrl.searchParams.set('mode', mode);
    window.location.href = nextUrl.toString();
  } else {
    // Scroll to first error
    const firstErr = document.querySelector('p.text-red-600:not(.hidden)');
    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});
