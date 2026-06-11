document.addEventListener('DOMContentLoaded', function () {
  requireAuth();
  loadProfile();
});

async function loadProfile() {
  const data = await apiCall('/profile');
  if (!data) return;

  // Update hero section
  const initials = (data.first_name[0] + data.last_name[0]).toUpperCase();
  document.querySelector('.profile-avatar-big').textContent = initials;
  document.querySelector('.profile-name').textContent = data.first_name + ' ' + data.last_name;

  // Update meta info
  const meta = document.querySelector('.profile-meta');
  meta.innerHTML = `
    <span><i class="fa-solid fa-id-card"></i> CID: ${data.cid}</span>
    <span><i class="fa-solid fa-droplet"></i> Blood Group: ${data.blood_group || 'N/A'}</span>
    <span><i class="fa-solid fa-calendar"></i> DOB: ${data.dob || 'N/A'}</span>
    <span><i class="fa-solid fa-location-dot"></i> ${data.dzongkhag || 'Bhutan'}</span>
  `;

  // Update sidebar
  const sidebarName = document.querySelector('.sidebar-user-name');
  const sidebarAvatar = document.querySelector('.sidebar-avatar');
  if (sidebarName) sidebarName.textContent = data.first_name + ' ' + data.last_name;
  if (sidebarAvatar) sidebarAvatar.textContent = initials;

  // Update avatar button in topnav
  const avatarBtn = document.querySelector('.avatar-btn');
  if (avatarBtn) avatarBtn.textContent = initials;

  // Update personal info fields
  setField('first_name', data.first_name);
  setField('last_name', data.last_name);
  setField('dob', data.dob);
  setField('gender', data.gender || '');
  setField('cid', data.cid);
  setField('nationality', 'Bhutanese');

  // Update contact fields
  setField('phone', data.phone);
  setField('email', data.email);
  setField('dzongkhag', data.dzongkhag || '');
  setField('village', data.village || '');

  // Update medical fields
  setField('blood_group', data.blood_group || '');
  setField('height', data.height_cm ? data.height_cm + ' cm' : '');
  setField('weight', data.weight_kg ? data.weight_kg + ' kg' : '');
  setField('bmi', data.weight_kg && data.height_cm ?
    (data.weight_kg / Math.pow(data.height_cm/100, 2)).toFixed(1) : '');
}

function setField(name, value) {
  const el = document.querySelector(`input[data-field="${name}"]`);
  if (el) el.value = value || '';
}
