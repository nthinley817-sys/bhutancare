document.addEventListener('DOMContentLoaded', function () {
  requireAuth();
  loadProfile();
});

async function loadProfile() {
  const token = getAuthToken();
  const res = await fetch('/api/profile', {
    headers: { Authorization: 'Bearer ' + token }
  });
  if (!res.ok) return;
  const data = await res.json();

  const initials = (data.first_name[0] + data.last_name[0]).toUpperCase();
  const fullName = data.first_name + ' ' + data.last_name;

  // Update hero
  document.querySelector('.profile-avatar-big').textContent = initials;
  document.querySelector('.profile-name').textContent = fullName;
  document.querySelector('.profile-meta').innerHTML = `
    <span><i class="fa-solid fa-id-card"></i> CID: ${data.cid}</span>
    <span><i class="fa-solid fa-droplet"></i> Blood Group: ${data.blood_group || 'N/A'}</span>
    <span><i class="fa-solid fa-calendar"></i> DOB: ${data.dob || 'N/A'}</span>
    <span><i class="fa-solid fa-location-dot"></i> ${data.dzongkhag || 'Bhutan'}</span>
  `;

  // Update sidebar & topnav
  const sidebarName = document.querySelector('.sidebar-user-name');
  const sidebarAvatar = document.querySelector('.sidebar-avatar');
  const avatarBtn = document.querySelector('.avatar-btn');
  if (sidebarName) sidebarName.textContent = fullName;
  if (sidebarAvatar) sidebarAvatar.textContent = initials;
  if (avatarBtn) avatarBtn.textContent = initials;

  // Fill form fields
  setField('first_name', data.first_name);
  setField('last_name', data.last_name);
  setField('dob', data.dob || '');
  setField('gender', data.gender || '');
  setField('cid', data.cid);
  setField('nationality', 'Bhutanese');
  setField('phone', data.phone || '');
  setField('email', data.email);
  setField('dzongkhag', data.dzongkhag || '');
  setField('village', data.village || '');
  setField('blood_group', data.blood_group || '');
  setField('height', data.height_cm ? data.height_cm + ' cm' : '');
  setField('weight', data.weight_kg ? data.weight_kg + ' kg' : '');

  const bmi = data.height_cm && data.weight_kg
    ? (data.weight_kg / Math.pow(data.height_cm / 100, 2)).toFixed(1)
    : '';
  setField('bmi', bmi ? bmi + ' (Normal)' : '');

  // Store original data for save
  window.profileData = data;
}

function setField(name, value) {
  const el = document.querySelector(`[data-field="${name}"]`);
  if (el) el.value = value || '';
}

function enableEdit(section) {
  const card = document.querySelector(`.edit-section-${section}`);
  if (!card) return;
  card.querySelectorAll('input, select').forEach(el => {
    if (el.dataset.field !== 'cid' && 
        el.dataset.field !== 'nationality' && 
        el.dataset.field !== 'email' &&
        el.dataset.field !== 'bmi') {
      el.removeAttribute('readonly');
      el.style.borderColor = 'var(--green-main)';
      el.style.background = 'white';
    }
  });
  const editBtn = card.querySelector('.edit-btn');
  if (editBtn) {
    editBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save';
    editBtn.onclick = () => saveSection(section);
  }
}

async function saveSection(section) {
  const card = document.querySelector(`.edit-section-${section}`);
  const inputs = {};
  card.querySelectorAll('input[data-field], select[data-field]').forEach(el => {
    inputs[el.dataset.field] = el.value;
  });

  const payload = {
    phone: inputs.phone || '',
    blood_group: inputs.blood_group || '',
    dzongkhag: inputs.dzongkhag || '',
    village: inputs.village || '',
    gender: inputs.gender || '',
    height_cm: parseInt(inputs.height) || 0,
    weight_kg: parseFloat(inputs.weight) || 0,
  };

  const token = getAuthToken();
  const res = await fetch('/api/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    showToast('Profile updated successfully!', 'success');
    card.querySelectorAll('input, select').forEach(el => {
      el.setAttribute('readonly', true);
      el.style.borderColor = '';
      el.style.background = '';
    });
    const editBtn = card.querySelector('.edit-btn');
    if (editBtn) {
      editBtn.innerHTML = '<i class="fa-solid fa-pen"></i> Edit';
      editBtn.onclick = () => enableEdit(section);
    }
    loadProfile();
  } else {
    showToast('Failed to save. Try again.', 'error');
  }
}
