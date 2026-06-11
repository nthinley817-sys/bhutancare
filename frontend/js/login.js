
// Handle Google OAuth redirect
(function() {
  const hash = window.location.hash;
  if (hash.includes('google_token=')) {
    const params = new URLSearchParams(hash.slice(1));
    const token  = params.get('google_token');
    const name   = params.get('name');
    const email  = params.get('email');
    const pic    = params.get('pic');
    if (token) {
      localStorage.setItem('bhutancare_token', token);
      localStorage.setItem('bhutancare_user', JSON.stringify({name, email}));
      if (pic) localStorage.setItem('bhutancare_profile_pic', pic);
      window.location.href = '/pages/dashboard.html';
    }
  }
})();

function loginWithGoogle() {
  window.location.href = '/api/auth/google';
}
const cursor = document.getElementById('cursor');
if (cursor) {
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });
}

function switchTab(tab) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('panel-' + tab).classList.add('active');
  if (tab === 'signin')   document.getElementById('tab-signin').classList.add('active');
  if (tab === 'register') document.getElementById('tab-register').classList.add('active');
  switchStep(1);
}

function togglePass(id, btn) {
  const input = document.getElementById(id);
  const icon  = btn.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fa-solid fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fa-solid fa-eye';
  }
}

function checkStrength(val) {
  const segs  = [document.getElementById('s1'), document.getElementById('s2'), document.getElementById('s3')];
  const label = document.getElementById('strength-label');
  segs.forEach(s => s.className = 'strength-seg');
  label.textContent = '';
  if (!val) return;
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const colors = ['', 'weak', 'fair', 'strong'];
  const labels = ['', 'Weak', 'Fair', 'Strong'];
  for (let i = 0; i < score; i++) segs[i].classList.add(colors[score]);
  label.textContent = labels[score];
  label.className = 'strength-label ' + colors[score];
}

function shakeCard() {
  const card = document.querySelector('.card');
  card.classList.add('shake');
  setTimeout(() => card.classList.remove('shake'), 500);
}

function showToastLocal(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    Object.assign(container.style, {
      position: 'fixed', bottom: '20px', right: '20px',
      display: 'flex', flexDirection: 'column', gap: '10px', zIndex: '9999'
    });
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.textContent = message;
  Object.assign(toast.style, {
    padding: '14px 18px', borderRadius: '12px', color: '#fff',
    minWidth: '220px', boxShadow: '0 10px 24px rgba(15,23,42,0.16)',
    opacity: '0', transform: 'translateY(10px)',
    transition: 'opacity 0.2s ease, transform 0.2s ease',
    background: type === 'error' ? '#dc2626' : '#16a34a'
  });
  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 200);
  }, 2800);
}

async function doSignIn(btn) {
  const identifier = document.getElementById('si-email').value.trim();
  const password   = document.getElementById('si-pass').value;
  if (!identifier || !password) {
    shakeCard();
    showToastLocal('Enter your CID/email and password', 'error');
    return;
  }
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in…';
  btn.disabled = true;
  try {
    const res  = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const data = await res.json();
    if (!res.ok) {
      btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Sign In';
      btn.disabled = false;
      shakeCard();
      showToastLocal(data.error || 'Login failed', 'error');
      return;
    }
    localStorage.setItem('bhutancare_token', data.token);
    localStorage.setItem('bhutancare_user',  JSON.stringify(data.user));
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Signed In!';
    btn.style.background = 'linear-gradient(135deg,#10b981,#059669)';
    showToastLocal('Welcome, ' + data.user.name + '!', 'success');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
  } catch (err) {
    btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Sign In';
    btn.disabled = false;
    showToastLocal('Cannot connect to server. Is the backend running?', 'error');
  }
}

async function doRegister(btn) {
  const first    = document.getElementById('reg-first').value.trim();
  const last     = document.getElementById('reg-last').value.trim();
  const cid      = document.getElementById('reg-cid').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const phone    = document.getElementById('reg-phone').value.trim();
  const password = document.getElementById('reg-pass').value;
  const agree    = document.getElementById('agree').checked;
  if (!first || !last || !cid || !email || !phone || !password || !agree) {
    shakeCard();
    showToastLocal('Complete all fields and accept terms', 'error');
    return;
  }
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating account…';
  btn.disabled = true;
  try {
    const res  = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name: first, last_name: last, cid, email, phone, password })
    });
    const data = await res.json();
    if (!res.ok) {
      btn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Create Account';
      btn.disabled = false;
      shakeCard();
      showToastLocal(data.error || 'Registration failed', 'error');
      return;
    }
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Account Created!';
    showToastLocal('Account created! Please sign in.', 'success');
    setTimeout(() => {
      btn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Create Account';
      btn.disabled = false;
      switchTab('signin');
    }, 1500);
  } catch (err) {
    btn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Create Account';
    btn.disabled = false;
    showToastLocal('Cannot connect to server.', 'error');
  }
}

const API = window.location.hostname === 'localhost' ? 'http://localhost:8080' : '';
let resetEmail = '';
let resetOTP = '';

function switchStep(n) {
  [1,2,3,4].forEach(i => {
    const el = document.getElementById('forgot-step'+i);
    if (el) el.style.display = i === n ? 'block' : 'none';
  });
}

async function doReset(btn) {
  const email = document.getElementById('reset-email').value.trim();
  if (!email) { shakeCard(); return; }
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';
  btn.disabled = true;
  try {
    const res = await fetch(API + '/api/auth/forgot-password', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({email})
    });
    const data = await res.json();
    if (res.ok) {
      resetEmail = email;
      switchStep(2);
    } else {
      showToastLocal(data.error || 'Failed to send OTP', 'error');
    }
  } catch(e) {
    showToastLocal('Cannot connect to server.', 'error');
  }
  btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send OTP';
  btn.disabled = false;
}

async function doVerifyOTP(btn) {
  const otp = document.getElementById('reset-otp').value.trim();
  if (otp.length !== 6) { shakeCard(); return; }
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying…';
  btn.disabled = true;
  try {
    const res = await fetch(API + '/api/auth/verify-otp', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({email: resetEmail, otp})
    });
    const data = await res.json();
    if (res.ok) {
      resetOTP = otp;
      switchStep(3);
    } else {
      showToastLocal(data.error || 'Invalid OTP', 'error');
    }
  } catch(e) {
    showToastLocal('Cannot connect to server.', 'error');
  }
  btn.innerHTML = '<i class="fa-solid fa-check"></i> Verify OTP';
  btn.disabled = false;
}

async function doResetPassword(btn) {
  const password = document.getElementById('reset-newpass').value;
  const confirm  = document.getElementById('reset-confirmpass').value;
  if (password.length < 8) { showToastLocal('Password must be at least 8 characters', 'error'); return; }
  if (password !== confirm) { showToastLocal('Passwords do not match', 'error'); return; }
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Resetting…';
  btn.disabled = true;
  try {
    const res = await fetch(API + '/api/auth/reset-password', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({email: resetEmail, otp: resetOTP, password})
    });
    const data = await res.json();
    if (res.ok) {
      switchStep(4);
    } else {
      showToastLocal(data.error || 'Failed to reset password', 'error');
    }
  } catch(e) {
    showToastLocal('Cannot connect to server.', 'error');
  }
  btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Reset Password';
  btn.disabled = false;
}
