// Toggle Delivery / Pickup
const deliveryBtn = document.getElementById('deliveryBtn');
const pickupBtn = document.getElementById('pickupBtn');
const deliveryCoverageBlock = document.getElementById('deliveryCoverageBlock');
const coverage = document.getElementById('coverage');

// Zonas de cobertura (solo entrega)
const zoneInput = document.getElementById('zone');
const zoneChips = document.querySelectorAll('.zone-chip');

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
