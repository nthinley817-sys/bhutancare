document.addEventListener('DOMContentLoaded', function () {
  requireAuth();
  loadDashboard();
});

async function loadDashboard() {
  try {
    const token = getAuthToken();
    const res = await fetch('/api/profile', {
      headers: { Authorization: 'Bearer ' + token }
    });
    if (!res.ok) return;
    const data = await res.json();

    console.log('Profile data:', data); // debug

    const firstName = data.first_name || data.FirstName || data.name || 'User';
    const lastName  = data.last_name  || data.LastName  || '';
    const initials  = (firstName[0] + (lastName[0] || '')).toUpperCase();
    const fullName  = firstName + (lastName ? ' ' + lastName : '');

    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

    // Update greeting
    const greeting = document.querySelector('.hero-left h2');
    if (greeting) greeting.textContent = `Good ${timeOfDay}, ${firstName}!`;

    // Update sidebar
    const sidebarName   = document.querySelector('.sidebar-user-name');
    const sidebarAvatar = document.querySelector('.sidebar-avatar');
    if (sidebarName)   sidebarName.textContent   = fullName;
    if (sidebarAvatar) sidebarAvatar.textContent = initials;

    // Update topnav avatar
    const avatarBtn = document.querySelector('.avatar-btn');
    if (avatarBtn) avatarBtn.textContent = initials;

  } catch (e) {
    console.error('Dashboard load error:', e);
  }
}
