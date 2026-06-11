document.addEventListener('DOMContentLoaded', function () {
  requireAuth();
  loadUserInfo();
});

async function loadUserInfo() {
  const data = await apiCall('/profile');
  if (!data) return;

  const initials = (data.first_name[0] + data.last_name[0]).toUpperCase();
  const firstName = data.first_name;

  // Update greeting
  const greeting = document.querySelector('.hero-left h2');
  if (greeting) {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    greeting.textContent = `Good ${timeOfDay}, ${firstName}!`;
  }

  // Update sidebar
  const sidebarName = document.querySelector('.sidebar-user-name');
  const sidebarAvatar = document.querySelector('.sidebar-avatar');
  if (sidebarName) sidebarName.textContent = data.first_name + ' ' + data.last_name;
  if (sidebarAvatar) sidebarAvatar.textContent = initials;

  // Update avatar button
  const avatarBtn = document.querySelector('.avatar-btn');
  if (avatarBtn) avatarBtn.textContent = initials;
}
