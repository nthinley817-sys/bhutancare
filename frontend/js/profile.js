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
  window.profileData = data;

  const initials = (data.first_name[0] + data.last_name[0]).toUpperCase();
  const fullName = data.first_name + ' ' + data.last_name;

  document.querySelector('.profile-avatar-big').textContent = initials;
  document.querySelector('.profile-name').textContent = fullName;
  document.querySelector('.profile-meta').innerHTML = `
    <span><i class="fa-solid fa-id-card"></i> CID: ${data.cid}</span>
    <span><i class="fa-solid fa-droplet"></i> Blood Group: ${data.blood_group || 'N/A'}</span>
    <span><i class="fa-solid fa-calendar"></i> DOB: ${data.dob || 'N/A'}</span>
    <span><i class="fa-solid fa-location-dot"></i> ${data.dzongkhag || 'Bhutan'}</span>
  `;

  const sidebarName   = document.querySelector('.sidebar-user-name');
  const sidebarAvatar = document.querySelector('.sidebar-avatar');
  const avatarBtn     = document.querySelector('.avatar-btn');
  if (sidebarName)   sidebarName.textContent   = fullName;
  if (sidebarAvatar) sidebarAvatar.textContent = initials;
  if (avatarBtn)     avatarBtn.textContent     = initials;

  setField('first_name', data.first_name);
  setField('last_name',  data.last_name);
  setField('dob',        data.dob || '');
  setField('gender',     data.gender || '');
  setField('cid',        data.cid);
  setField('nationality','Bhutanese');
  setField('phone',      data.phone || '');
  setField('email',      data.email);
  setField('dzongkhag',  data.dzongkhag || '');
  setField('village',    data.village || '');
  setField('blood_group',data.blood_group || '');
  setField('height',     data.height_cm || '');
  setField('weight',     data.weight_kg || '');

  if (data.height_cm && data.weight_kg) {
    const bmi = (data.weight_kg / Math.pow(data.height_cm / 100, 2)).toFixed(1);
    setField('bmi', bmi);
  }
}

function setField(name, value) {
  const el = document.querySelector(`[data-field="${name}"]`);
  if (!el) return;
  el.value = value || '';
}

function enableEdit(section) {
  const card = document.querySelector(`.edit-section-${section}`);
  if (!card) return;

  const locked = ['cid', 'nationality', 'email', 'bmi'];

  card.querySelectorAll('input[data-field], select[data-field]').forEach(el => {
    if (locked.includes(el.dataset.field)) return;
    el.removeAttribute('readonly');
    el.removeAttribute('disabled');
    el.style.borderColor = 'var(--green-main)';
    el.style.background  = '#f3faf6';
    el.style.cursor      = 'text';
  });

  const editBtn = card.querySelector('.edit-btn');
  if (editBtn) {
    editBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save';
    editBtn.className = 'btn btn-primary btn-sm edit-btn';
    editBtn.onclick   = () => saveSection(section);
  }
}

async function saveSection(section) {
  const card = document.querySelector(`.edit-section-${section}`);
  const get  = f => { const el = card.querySelector(`[data-field="${f}"]`); return el ? el.value : ''; };

  const payload = {
    phone:       get('phone'),
    blood_group: get('blood_group'),
    dzongkhag:   get('dzongkhag'),
    village:     get('village'),
    gender:      get('gender'),
    height_cm:   parseInt(get('height'))  || 0,
    weight_kg:   parseFloat(get('weight'))|| 0,
  };

  const token = getAuthToken();
  const res = await fetch('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    showToast('Profile updated successfully!', 'success');
    card.querySelectorAll('input[data-field], select[data-field]').forEach(el => {
      el.setAttribute('readonly', true);
      if (el.tagName === 'SELECT') el.setAttribute('disabled', true);
      el.style.borderColor = '';
      el.style.background  = '';
      el.style.cursor      = '';
    });
    const editBtn = card.querySelector('.edit-btn');
    if (editBtn) {
      editBtn.innerHTML = '<i class="fa-solid fa-pen"></i> Edit';
      editBtn.className = 'btn btn-secondary btn-sm edit-btn';
      editBtn.onclick   = () => enableEdit(section);
    }
    loadProfile();
  } else {
    showToast('Failed to save. Try again.', 'error');
  }
}
