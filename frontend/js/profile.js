document.addEventListener('DOMContentLoaded', function () {
  requireAuth();
  loadProfile();
  initAutoCalc();
});

function initAutoCalc() {
  document.addEventListener('input', function(e) {
    if (e.target.dataset.field === 'height' || e.target.dataset.field === 'weight') calcBMI();
  });
  document.addEventListener('change', function(e) {
    if (e.target.dataset.field === 'dob') calcAge();
  });
}

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

async function loadProfile() {
  try {
    const token = getAuthToken();
    if (!token) { window.location.href = 'login.html'; return; }

    const res = await fetch('/api/profile', {
      headers: { Authorization: 'Bearer ' + token }
    });

    if (!res.ok) {
      console.error('Profile API error:', res.status);
      showToast('Failed to load profile. Please refresh.', 'error');
      return;
    }

    const data = await res.json();
    console.log('Profile loaded:', data);
    window.profileData = data;

    const fn  = data.first_name || '';
    const ln  = data.last_name  || '';
    const initials = fn && ln ? (fn[0] + ln[0]).toUpperCase() : fn ? fn[0].toUpperCase() : 'U';
    const fullName = fn + (ln ? ' ' + ln : '');

    // Age calculation
    let ageStr = '';
    if (data.dob) {
      const age = Math.floor((new Date() - new Date(data.dob)) / (365.25 * 24 * 60 * 60 * 1000));
      ageStr = age + ' years';
    }

    // BMI calculation
    let bmiStr = '';
    if (data.height_cm && data.weight_kg) {
      const bmi = (data.weight_kg / Math.pow(data.height_cm / 100, 2)).toFixed(1);
      const cat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
      bmiStr = bmi + ' (' + cat + ')';
    }

    // Update hero section
    const avatarEl = document.querySelector('.profile-avatar-big');
    const nameEl   = document.querySelector('.profile-name');
    const metaEl   = document.querySelector('.profile-meta');

    if (avatarEl) avatarEl.textContent = initials;
    if (nameEl)   nameEl.textContent   = fullName;
    if (metaEl)   metaEl.innerHTML = `
      <span><i class="fa-solid fa-id-card"></i> CID: ${data.cid || 'N/A'}</span>
      <span><i class="fa-solid fa-droplet"></i> Blood Group: ${data.blood_group || 'N/A'}</span>
      <span><i class="fa-solid fa-calendar"></i> DOB: ${data.dob ? data.dob.substring(0,10) : 'N/A'}</span>
      <span><i class="fa-solid fa-location-dot"></i> ${data.dzongkhag || 'Bhutan'}</span>
      ${ageStr ? `<span><i class="fa-solid fa-user"></i> Age: ${ageStr}</span>` : ''}
      ${bmiStr ? `<span><i class="fa-solid fa-weight-scale"></i> BMI: ${bmiStr}</span>` : ''}
    `;

    // Update sidebar & topnav
    const sidebarName   = document.querySelector('.sidebar-user-name');
    const sidebarAvatar = document.querySelector('.sidebar-avatar');
    const avatarBtn     = document.querySelector('.avatar-btn');
    if (sidebarName)   sidebarName.textContent   = fullName;
    if (sidebarAvatar && !data.profile_pic) sidebarAvatar.textContent = initials;
    if (avatarBtn && !data.profile_pic)     avatarBtn.textContent     = initials;

    // Show profile picture if exists
    if (data.profile_pic) showProfilePic(data.profile_pic);

    // Fill all form fields
    setField('first_name',  data.first_name  || '');
    setField('last_name',   data.last_name   || '');
    setField('dob',         data.dob ? data.dob.substring(0,10) : '');
    setField('age',         ageStr);
    setField('gender',      data.gender      || '');
    setField('cid',         data.cid         || '');
    setField('nationality', 'Bhutanese');
    setField('phone',       data.phone       || '');
    setField('email',       data.email       || '');
    setField('dzongkhag',   data.dzongkhag   || '');
    setField('village',     data.village     || '');
    setField('blood_group', data.blood_group || '');
    setField('height',      data.height_cm   || '');
    setField('weight',      data.weight_kg   || '');
    setField('bmi',         bmiStr);

  } catch(e) {
    console.error('loadProfile error:', e);
    showToast('Connection error. Is the backend running?', 'error');
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
  if (!card) return;

  const payload = {};

  if (section === 'personal') {
    const gender = card.querySelector('[data-field="gender"]')?.value;
    const dob    = card.querySelector('[data-field="dob"]')?.value;
    if (gender !== undefined) payload.gender = gender;
    if (dob    !== undefined) payload.dob    = dob;
  }
  if (section === 'contact') {
    const phone     = card.querySelector('[data-field="phone"]')?.value;
    const dzongkhag = card.querySelector('[data-field="dzongkhag"]')?.value;
    const village   = card.querySelector('[data-field="village"]')?.value;
    if (phone     !== undefined) payload.phone     = phone;
    if (dzongkhag !== undefined) payload.dzongkhag = dzongkhag;
    if (village   !== undefined) payload.village   = village;
  }
  if (section === 'medical') {
    const blood_group = card.querySelector('[data-field="blood_group"]')?.value;
    const height      = card.querySelector('[data-field="height"]')?.value;
    const weight      = card.querySelector('[data-field="weight"]')?.value;
    if (blood_group !== undefined) payload.blood_group = blood_group;
    if (height      !== undefined) payload.height_cm   = parseInt(height)   || 0;
    if (weight      !== undefined) payload.weight_kg   = parseFloat(weight) || 0;
  }

  const token = getAuthToken();
  const res = await fetch('/api/profile', {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body:    JSON.stringify(payload)
  });

  if (res.ok) {
    showToast('Saved successfully!', 'success');
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
    const err = await res.json().catch(() => ({}));
    showToast('Failed: ' + (err.error || 'Try again'), 'error');
  }
}

async function changePassword() {
  const curPass = document.getElementById('cur-pass')?.value;
  const newPass = document.getElementById('new-pass')?.value;
  const conPass = document.getElementById('con-pass')?.value;

  if (!curPass || !newPass || !conPass) {
    showToast('Please fill in all password fields', 'error'); return;
  }
  if (newPass.length < 8) {
    showToast('New password must be at least 8 characters', 'error'); return;
  }
  if (newPass !== conPass) {
    showToast('New passwords do not match', 'error'); return;
  }

  const token = getAuthToken();
  const res = await fetch('/api/profile/password', {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body:    JSON.stringify({ current_password: curPass, new_password: newPass })
  });

  const data = await res.json().catch(() => ({}));
  if (res.ok) {
    showToast('Password updated successfully!', 'success');
    document.getElementById('cur-pass').value = '';
    document.getElementById('new-pass').value = '';
    document.getElementById('con-pass').value = '';
    document.getElementById('pwd-strength-label').textContent = '';
    document.getElementById('pwd-match-label').textContent    = '';
    ['ps1','ps2','ps3'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.background = 'var(--border)';
    });
  } else {
    showToast(data.error || 'Failed to update password', 'error');
  }
}

async function uploadProfilePic(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    showToast('Image must be under 2MB', 'error'); return;
  }
  showToast('Uploading...', 'info', 1500);
  const formData = new FormData();
  formData.append('profile_pic', file);
  const token = getAuthToken();
  const res = await fetch('/api/profile/picture', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token },
    body: formData
  });
  if (res.ok) {
    const data = await res.json();
    showProfilePic(data.profile_pic);
    showToast('Profile picture updated!', 'success');
  } else {
    showToast('Failed to upload. Try again.', 'error');
  }
}

function showProfilePic(picData) {
  const avatar = document.getElementById('profileAvatar');
  const img    = document.getElementById('profilePicImg');
  if (!picData || picData === '') {
    if (avatar) avatar.style.display = 'flex';
    if (img)    img.style.display    = 'none';
    return;
  }
  if (avatar) avatar.style.display = 'none';
  if (img) { img.src = picData; img.style.display = 'block'; }

  const sidebarAvatar = document.querySelector('.sidebar-avatar');
  if (sidebarAvatar) {
    sidebarAvatar.innerHTML = `<img src="${picData}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`;
  }
  const avatarBtn = document.querySelector('.avatar-btn');
  if (avatarBtn) {
    avatarBtn.innerHTML        = `<img src="${picData}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`;
    avatarBtn.style.padding    = '0';
    avatarBtn.style.overflow   = 'hidden';
  }
}

function togglePwd(id, btn) {
  const input = document.getElementById(id);
  const icon  = btn.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.className   = 'fa-solid fa-eye-slash';
    btn.style.color  = 'var(--green-main)';
  } else {
    input.type = 'password';
    icon.className   = 'fa-solid fa-eye';
    btn.style.color  = 'var(--text-muted)';
  }
}

function checkPwdStrength(val) {
  const segs  = ['ps1','ps2','ps3'].map(id => document.getElementById(id));
  const label = document.getElementById('pwd-strength-label');
  if (!segs[0] || !label) return;
  segs.forEach(s => { if(s) s.style.background = 'var(--border)'; });
  label.textContent = '';
  if (!val) return;
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const colors = ['','#ef4444','#f59e0b','#10b981'];
  const labels = ['','Weak','Fair','Strong'];
  for (let i = 0; i < score; i++) if(segs[i]) segs[i].style.background = colors[score];
  label.textContent = labels[score];
  label.style.color = colors[score];
}

function checkPwdMatch() {
  const newPass = document.getElementById('new-pass')?.value;
  const conPass = document.getElementById('con-pass')?.value;
  const label   = document.getElementById('pwd-match-label');
  if (!label || !conPass) return;
  if (newPass === conPass) {
    label.textContent = '✓ Passwords match';
    label.style.color = 'var(--green-main)';
  } else {
    label.textContent = '✗ Passwords do not match';
    label.style.color = 'var(--red)';
  }
}
