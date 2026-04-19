// script.js - Frontend logic for SplashZone Car Wash App
// This file handles ALL API communication and dynamic UI updates

const API = 'http://localhost:5000/api';

// ══════════════════════════════════════════════
// SHARED — runs on both pages
// ══════════════════════════════════════════════

// Load services into a <select> dropdown
async function loadServices(selectId) {
  try {
    const res = await fetch(`${API}/services`);
    const services = await res.json();

    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = '<option value="">-- Select a service --</option>';
    services.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.name} — ₹${s.price} (${s.duration} min)`;
      select.appendChild(opt);
    });

    return services; // return for service cards use
  } catch (err) {
    console.error('Failed to load services:', err);
  }
}

// Show a message (success or error)
function showMessage(elementId, text, type = 'success') {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = text;
  el.className = `form-message ${type}`;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 4000);
}

// Format time from HH:MM:SS → HH:MM AM/PM
function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

// Format date from YYYY-MM-DD → DD Mon YYYY
function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Status badge HTML
function badgeHTML(status) {
  return `<span class="badge badge-${status}">${status}</span>`;
}


// ══════════════════════════════════════════════
// INDEX.HTML — Booking Form
// ══════════════════════════════════════════════

// Load services into dropdown + render service cards
async function initBookingPage() {
  const services = await loadServices('service_id');
  if (!services) return;

  const container = document.getElementById('service-cards');
  if (!container) return;

  container.innerHTML = '';
  services.forEach(s => {
    container.innerHTML += `
      <div class="service-card">
        <div>
          <div class="svc-name">${s.name}</div>
          <div class="svc-duration">⏱ ${s.duration} minutes</div>
        </div>
        <div class="svc-price">₹${parseFloat(s.price).toFixed(0)}</div>
      </div>`;
  });
}

// Submit a new booking — CREATE operation
async function submitBooking() {
  const data = {
    customer_name: document.getElementById('customer_name').value.trim(),
    phone:         document.getElementById('phone').value.trim(),
    car_model:     document.getElementById('car_model').value.trim(),
    service_id:    document.getElementById('service_id').value,
    booking_date:  document.getElementById('booking_date').value,
    booking_time:  document.getElementById('booking_time').value,
  };

  // Frontend validation
  for (const [key, val] of Object.entries(data)) {
    if (!val) {
      showMessage('form-message', '⚠️ Please fill in all fields.', 'error');
      return;
    }
  }

  try {
    const res = await fetch(`${API}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (res.ok) {
      showMessage('form-message', `✅ Booking confirmed! Your booking ID is #${result.bookingId}`, 'success');
      // Clear form
      ['customer_name','phone','car_model','service_id','booking_date','booking_time']
        .forEach(id => document.getElementById(id).value = '');
    } else {
      showMessage('form-message', `❌ ${result.error}`, 'error');
    }
  } catch (err) {
    showMessage('form-message', '❌ Could not connect to server. Is the backend running?', 'error');
  }
}


// ══════════════════════════════════════════════
// BOOKINGS.HTML — Manage Bookings
// ══════════════════════════════════════════════

// Load and display all bookings — READ operation
async function loadBookings() {
  try {
    const res = await fetch(`${API}/bookings`);
    const bookings = await res.json();

    const tbody = document.getElementById('bookings-body');
    if (!tbody) return;

    if (bookings.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="loading-row">No bookings found.</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    bookings.forEach(b => {
      tbody.innerHTML += `
        <tr>
          <td>#${b.id}</td>
          <td>${b.customer_name}</td>
          <td>${b.phone}</td>
          <td>${b.car_model}</td>
          <td>${b.service_name}</td>
          <td>${formatDate(b.booking_date)}</td>
          <td>${formatTime(b.booking_time)}</td>
          <td>${badgeHTML(b.status)}</td>
          <td>
            <div class="actions-cell">
              <button class="btn-edit" onclick="openEditModal(${b.id})">Edit</button>
              <button class="btn-delete" onclick="deleteBooking(${b.id})">Delete</button>
            </div>
          </td>
        </tr>`;
    });
  } catch (err) {
    document.getElementById('bookings-body').innerHTML =
      '<tr><td colspan="9" class="loading-row">❌ Could not load bookings. Is the backend running?</td></tr>';
  }
}

// DELETE operation
async function deleteBooking(id) {
  if (!confirm(`Are you sure you want to delete booking #${id}?`)) return;

  try {
    const res = await fetch(`${API}/bookings/${id}`, { method: 'DELETE' });
    const result = await res.json();

    if (res.ok) {
      showMessage('table-message', `✅ Booking #${id} deleted.`, 'success');
      loadBookings(); // refresh table
    } else {
      showMessage('table-message', `❌ ${result.error}`, 'error');
    }
  } catch (err) {
    showMessage('table-message', '❌ Could not connect to server.', 'error');
  }
}

// Open edit modal and pre-fill with existing data — READ ONE
async function openEditModal(id) {
  try {
    const res = await fetch(`${API}/bookings/${id}`);
    const b = await res.json();

    document.getElementById('edit-id').value           = b.id;
    document.getElementById('edit-customer_name').value = b.customer_name;
    document.getElementById('edit-phone').value         = b.phone;
    document.getElementById('edit-car_model').value     = b.car_model;
    document.getElementById('edit-booking_date').value  = b.booking_date?.split('T')[0];
    document.getElementById('edit-booking_time').value  = b.booking_time;
    document.getElementById('edit-status').value        = b.status;

    await loadServices('edit-service_id');
    document.getElementById('edit-service_id').value = b.service_id;

    document.getElementById('edit-modal').classList.remove('hidden');
  } catch (err) {
    showMessage('table-message', '❌ Could not load booking details.', 'error');
  }
}

// Close modal
function closeModal() {
  document.getElementById('edit-modal').classList.add('hidden');
}

// Save edit — UPDATE operation
async function saveEdit() {
  const id = document.getElementById('edit-id').value;

  const data = {
    customer_name: document.getElementById('edit-customer_name').value.trim(),
    phone:         document.getElementById('edit-phone').value.trim(),
    car_model:     document.getElementById('edit-car_model').value.trim(),
    service_id:    document.getElementById('edit-service_id').value,
    booking_date:  document.getElementById('edit-booking_date').value,
    booking_time:  document.getElementById('edit-booking_time').value,
    status:        document.getElementById('edit-status').value,
  };

  try {
    const res = await fetch(`${API}/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (res.ok) {
      closeModal();
      showMessage('table-message', `✅ Booking #${id} updated successfully!`, 'success');
      loadBookings(); // refresh table
    } else {
      showMessage('table-message', `❌ ${result.error}`, 'error');
    }
  } catch (err) {
    showMessage('table-message', '❌ Could not connect to server.', 'error');
  }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  const modal = document.getElementById('edit-modal');
  if (modal && e.target === modal) closeModal();
});

// ══════════════════════════════════════════════
// AUTO-INIT based on current page
// ══════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('service_id'))   initBookingPage();
  if (document.getElementById('bookings-body')) loadBookings();
});
