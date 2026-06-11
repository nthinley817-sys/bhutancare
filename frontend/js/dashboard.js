document.addEventListener('DOMContentLoaded', function () {
  requireAuth();
  loadDashboard();
});

async function loadDashboard() {
  const res = await fetch('/api/profile', {
    headers: { Authorization: 'Bearer ' + getAuthToken() }
  });
  if (!res.ok) return;
  const data = await res.json();

  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  const greeting = document.querySelector('.hero-left h2');
  if (greeting) greeting.textContent = `Good ${timeOfDay}, ${data.first_name}!`;
}
