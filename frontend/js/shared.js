function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'dashboard.html';
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.remove('active');
    if (el.getAttribute('href') === page) el.classList.add('active');
  });
}

function initSidebar() {
  const btn  = document.getElementById('hamburgerBtn');
  const side = document.getElementById('sidebar');
  if (!btn || !side) return;
  btn.addEventListener('click', e => {
    e.stopPropagation();
    side.classList.toggle('open');
    btn.classList.toggle('open');
  });
  document.addEventListener('click', e => {
    if (side.classList.contains('open') &&
        !side.contains(e.target) && !btn.contains(e.target)) {
      side.classList.remove('open');
      btn.classList.remove('open');
    }
  });
}

function showToast(msg, type = 'success', duration = 3000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = {
    success: 'fa-circle-check', error: 'fa-circle-xmark',
    warning: 'fa-triangle-exclamation', info: 'fa-circle-info'
  };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.success}"></i><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease both';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function initModals() {
  document.querySelectorAll('[data-modal-open]').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.modalOpen));
  });
  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.modalClose));
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape')
      document.querySelectorAll('.modal-overlay.open')
              .forEach(m => m.classList.remove('open'));
  });
}

function getAuthToken()  { return localStorage.getItem('bhutancare_token'); }
function clearAuthData() {
  localStorage.removeItem('bhutancare_token');
  localStorage.removeItem('bhutancare_user');
}

function logout(redirect = true) {
  clearAuthData();
  if (redirect) window.location.href = 'login.html';
}

function requireAuth() {
  const token = getAuthToken();
  if (!token) { window.location.href = 'login.html'; return false; }
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
    if (!payload.exp || payload.exp * 1000 < Date.now()) {
      clearAuthData();
      window.location.href = 'login.html';
      return false;
    }
  } catch (e) {
    clearAuthData();
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

async function apiCall(endpoint, options = {}) {
  const token = getAuthToken();
  if (!token) { logout(); return null; }
  const res = await fetch('/api' + endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
      ...(options.headers || {})
    }
  });
  if (res.status === 401 || res.status === 403) { logout(); return null; }
  return res.json();
}

// Load and display real user info on every page
async function loadSharedUserInfo() {
  const token = getAuthToken();
  if (!token) return;

  try {
    const res = await fetch('/api/profile', {
      headers: { Authorization: 'Bearer ' + token }
    });
    if (!res.ok) return;
    const data = await res.json();

    const initials = (( data.first_name || data.FirstName || "U")[0] + ( data.last_name || data.LastName || "")[0]).toUpperCase();
    const fullName = data.first_name + ' ' + data.last_name;

    // Update sidebar user info
    const sidebarName   = document.querySelector('.sidebar-user-name');
    const sidebarAvatar = document.querySelector('.sidebar-avatar');
    const sidebarRole   = document.querySelector('.sidebar-user-role');
    if (sidebarName)   sidebarName.textContent   = fullName;
    if (sidebarAvatar) sidebarAvatar.textContent = initials;
    if (sidebarRole)   sidebarRole.textContent   = 'Patient · CID ' + data.cid.substring(0,8) + '...';

    // Update topnav avatar
    const avatarBtn = document.querySelector('.avatar-btn');
    if (avatarBtn) avatarBtn.textContent = initials;

    // Store for other functions to use
    window.currentUser = data;
  } catch (e) {
    console.log('Could not load user info:', e);
  }
}

function initLogoutButton() {
  const topnav = document.querySelector('.topnav-right');
  if (!topnav || topnav.querySelector('.logout-btn')) return;
  const btn = document.createElement('button');
  btn.className = 'topnav-btn logout-btn';
  btn.type = 'button';
  btn.title = 'Logout';
  btn.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i>';
  btn.addEventListener('click', () => logout());
  topnav.appendChild(btn);
}

document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  initSidebar();
  initModals();
  initLogoutButton();
  loadSharedUserInfo(); // Load real user on every page
});

// Load profile pic from API and set on all sidebar avatars
async function loadSidebarProfilePic() {
  const token = getAuthToken();
  if (!token || tokenExpired(token)) return;

  // Check cache first
  const cached = localStorage.getItem('bhutancare_profile_pic');
  if (cached) {
    setSidebarPic(cached);
    return;
  }

  try {
    const data = await apiCall('/profile');
    if (data && data.profile_pic) {
      localStorage.setItem('bhutancare_profile_pic', data.profile_pic);
      setSidebarPic(data.profile_pic);
    }
  } catch(e) {}
}

function setSidebarPic(url) {
  if (!url) return;
  document.querySelectorAll('.sidebar-avatar').forEach(el => {
    el.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.parentElement.textContent=this.parentElement.dataset.initials">`;
  });
  const topAvatar = document.querySelector('.avatar-btn');
  if (topAvatar) {
    topAvatar.dataset.initials = topAvatar.textContent;
    topAvatar.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.textContent=this.dataset.initials">`;
  }
}
