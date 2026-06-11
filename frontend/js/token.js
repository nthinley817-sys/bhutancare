document.addEventListener('DOMContentLoaded', function () { requireAuth(); });
function selectDept(el) {
  document.querySelectorAll('.dept-card').forEach(d => d.classList.remove('selected'));
  el.classList.add('selected');
}
function issueToken() {
  closeModal('getTokenModal');
  document.getElementById('myToken').textContent = 'B-08';
  document.getElementById('etaText').textContent = 'Est. 10 min wait';
  document.getElementById('nowServing').textContent = 'B-05';
  document.getElementById('waitCount').textContent = '2';
  showToast('Token B-08 issued! 2 patients ahead of you.', 'success', 4000);
}
setInterval(() => {
  const eta = document.getElementById('etaText');
  if (!eta) return;
  const match = eta.textContent.match(/(\d+)/);
  if (match) {
    const mins = parseInt(match[1]);
    if (mins > 1) eta.textContent = `Est. ${mins - 1} min wait`;
  }
}, 30000);
