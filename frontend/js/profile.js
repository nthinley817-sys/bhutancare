document.addEventListener('DOMContentLoaded', function () {
  requireAuth();
  loadProfile();
  initBMICalculator();
});

function initBMICalculator() {
  function calcBMI() {
    const h = parseFloat(document.querySelector('[data-field="height"]')?.value);
    const w = parseFloat(document.querySelector('[data-field="weight"]')?.value);
    const bmiEl = document.querySelector('[data-field="bmi"]');
    if (!bmiEl) return;
    if (!h || !w || h < 50 || h > 300) { bmiEl.value = ''; return; }
    const bmi = (w / Math.pow(h / 100, 2)).toFixed(1);
    const cat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
    bmiEl.value = bmi + ' (' + cat + ')';
    bmiEl.style.color = bmi < 18.5 || bmi >= 30 ? 'var(--red)' : bmi < 25 ? 'var(--green-main)' : 'var(--amber)';
    bmiEl.style.fontWeight = '600';
  }

  function calcAge() {
    const dobEl = document.querySelector('[data-field="dob"]');
    const ageEl = document.querySelector('[data-field="age"]');
    if (!dobEl?.value || !ageEl) return;
    const age = Math.floor((new Date() - new Date(dobEl.value)) / (365.25 * 24 * 60 * 60 * 1000));
    ageEl.value = age + ' years';
    ageEl.style.color = 'var(--green-main)';
    ageEl.style.fontWeight = '600';
  }

  // Use MutationObserver + event delegation to catch dynamically enabled fields
  document.addEventListener('input', function(e) {
    if (e.target.dataset.field === 'height' || e.target.dataset.field === 'weight') calcBMI();
  });
  document.addEventListener('change', function(e) {
    if (e.target.dataset.field === 'dob') calcAge();
  });

  // Also run on page load if values exist
  setTimeout(() => { calcBMI(); calcAge(); }, 500);
}

async function loadProfile() {
  const token = getAuthToken();
  const res = await fetch('/api/profile', {
    headers: { Authorization: 'Bearer ' + token }
  });
  if (!res.ok) return;
  const data = await res.json();
  window.profileData = data;

  const initials = (data.first_name[0] + data.last_name[0]).toUpperCase();
  const fullName  = data.first_name + ' ' + data.last_name;

  document.querySelector('.profile-avatar-big').textContent = initials;
  document.querySelector('.profile-name').textContent       = fullName;

  // Calculate age
  let ageStr = '';
  if (data.dob) {
    const age = Math.floor((new Date() - new Date(data.dob)) / (365.25 * 24 * 60 * 60 * 1000));
    ageStr = `${age} years`;
  }

  // Calculate BMI
  let bmiStr = '';
  if (data.height_cm && data.weight_kg) {
    const bmi = (data.weight_kg / Math.pow(data.height_cm / 100, 2)).toFixed(1);
    let cat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
    bmiStr = `${bmi} (${cat})`;
  }

  document.querySelector('.profile-meta').innerHTML = `
    <span><i class="fa-solid fa-id-card"></i> CID: ${data.cid}</span>
    <span><i class="fa-solid fa-droplet"></i> Blood Group: ${data.blood_group || 'N/A'}</span>
    <span><i class="fa-solid fa-calendar"></i> DOB: ${data.dob ? data.dob.substring(0,10) : 'N/A'}</span>
    <span><i class="fa-solid fa-location-dot"></i> ${data.dzongkhag || 'Bhutan'}</span>
    ${ageStr ? `<span><i class="fa-solid fa-user"></i> Age: ${ageStr}</span>` : ''}
    ${bmiStr ? `<span><i class="fa-solid fa-weight-scale"></i> BMI: ${bmiStr}</span>` : ''}
  `;

  const sidebarName   = document.querySelector('.sidebar-user-name');
  const sidebarAvatar = document.querySelector('.sidebar-avatar');
  const avatarBtn     = document.querySelector('.avatar-btn');
  if (sidebarName)   sidebarName.textContent   = fullName;
  if (sidebarAvatar) sidebarAvatar.textContent = initials;
  if (avatarBtn)     avatarBtn.textContent     = initials;

  setField('first_name',  data.first_name);
  setField('last_name',   data.last_name);
  setField('dob',         data.dob ? data.dob.substring(0,10) : '');
  setField('age',         ageStr);
  setField('gender',      data.gender || '');
  setField('cid',         data.cid);
  setField('nationality', 'Bhutanese');
  setField('phone',       data.phone || '');
  setField('email',       data.email);
  setField('dzongkhag',   data.dzongkhag || '');
  setField('village',     data.village || '');
  setField('blood_group', data.blood_group || '');
  setField('height',      data.height_cm || '');
  setField('weight',      data.weight_kg || '');
  setField('bmi',         bmiStr);
}

function setField(name, value) {
  const el = document.querySelector(`[data-field="${name}"]`);
  if (!el) return;
  el.value = value || '';
}

function enableEdit(section) {
  const card   = document.querySelector(`.edit-section-${section}`);
  if (!card) return;
  const locked = ['cid', 'nationality', 'email', 'bmi', 'age'];
  card.querySelectorAll('input[data-field], select[data-field]').forEach(el => {
    if (locked.includes(el.dataset.field)) return;
    el.removeAttribute('readonly');
    el.removeAttribute('disabled');
    el.style.borderColor = 'var(--green-main)';
    el.style.background  = '#f3faf6';
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
    dob:         get('dob'),
    height_cm:   parseInt(get('height'))   || 0,
    weight_kg:   parseFloat(get('weight')) || 0,
  };
  const token = getAuthToken();
  const res = await fetch('/api/profile', {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body:    JSON.stringify(payload)
  });
  if (res.ok) {
    showToast('Profile updated successfully!', 'success');
    card.querySelectorAll('input[data-field], select[data-field]').forEach(el => {
      el.setAttribute('readonly', true);
      if (el.tagName === 'SELECT') el.setAttribute('disabled', true);
      el.style.borderColor = '';
      el.style.background  = '';
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

// Override initBMICalculator to watch DOB from personal section too
document.addEventListener('DOMContentLoaded', function() {
  const dobEl = document.querySelector('[data-field="dob"]');
  if (dobEl) {
    dobEl.addEventListener('change', function() {
      const ageEl = document.querySelector('[data-field="age"]');
      if (!ageEl || !this.value) return;
      const age = Math.floor((new Date() - new Date(this.value)) / (365.25 * 24 * 60 * 60 * 1000));
      ageEl.value = age + ' years';
      ageEl.style.color = 'var(--green-main)';
      ageEl.style.fontWeight = '600';
    });
  }
});
